import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import type { AuthProvider } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { UpdateMeDto } from './dto';

function sha256(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

type UserWithStats = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  country: string | null;
  passwordHash: string | null;
  createdAt: Date;
  stats: {
    xp: number;
    level: number;
    streakCount: number;
    competitionsPlayed: number;
    wins: number;
  } | null;
};

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async googleSignIn(idToken: string) {
    const audiences = (this.config.get<string>('GOOGLE_CLIENT_ID') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (audiences.length === 0) {
      throw new ServiceUnavailableException('Google sign-in is not configured');
    }
    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({ idToken, audience: audiences });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google token');
    }
    return this.socialSignIn('GOOGLE', payload.sub, payload.email, payload.name, payload.picture);
  }

  private async socialSignIn(
    provider: AuthProvider,
    providerUserId: string,
    email: string,
    name?: string,
    picture?: string,
  ) {
    const e = email.toLowerCase().trim();

    const identity = await this.prisma.authIdentity.findUnique({
      where: { provider_providerUserId: { provider, providerUserId } },
      include: { user: { include: { stats: true } } },
    });
    if (identity) return this.session(identity.user);

    const linked = await this.prisma.user.findUnique({
      where: { email: e },
      include: { stats: true },
    });
    if (linked) {
      await this.prisma.authIdentity.create({
        data: { provider, providerUserId, userId: linked.id },
      });
      return this.session(linked);
    }

    const username = await this.uniqueUsername(name ?? e.split('@')[0]);
    const created = await this.prisma.user.create({
      data: {
        email: e,
        username,
        displayName: name ?? username,
        avatarUrl: picture ?? null,
        country: 'TR',
        stats: { create: {} },
        authIdentities: { create: { provider, providerUserId } },
      },
      include: { stats: true },
    });
    return this.session(created);
  }

  private async uniqueUsername(seed: string): Promise<string> {
    let base = seed.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 18);
    if (base.length < 3) base = 'trader' + base;
    let candidate = base;
    for (let i = 0; i < 25; i++) {
      const exists = await this.prisma.user.findUnique({ where: { username: candidate } });
      if (!exists) return candidate;
      candidate = base.slice(0, 14) + Math.floor(Math.random() * 10000);
    }
    return base.slice(0, 12) + Date.now().toString().slice(-6);
  }

  private publicUser(u: UserWithStats) {
    const s = u.stats;
    return {
      id: u.id,
      email: u.email,
      username: u.username,
      displayName: u.displayName ?? u.username,
      avatarUrl: u.avatarUrl,
      country: u.country,
      createdAt: u.createdAt,
      stats: {
        xp: s?.xp ?? 0,
        level: s?.level ?? 1,
        streakCount: s?.streakCount ?? 0,
        competitionsPlayed: s?.competitionsPlayed ?? 0,
        wins: s?.wins ?? 0,
        winRate:
          s && s.competitionsPlayed > 0 ? (s.wins / s.competitionsPlayed) * 100 : 0,
      },
    };
  }

  async register(email: string, password: string, username: string) {
    const e = email.toLowerCase().trim();
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: e }, { username }] },
    });
    if (existing) throw new ConflictException('Email or username already taken');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: e,
        username,
        displayName: username,
        passwordHash,
        country: 'TR',
        stats: { create: {} },
      },
      include: { stats: true },
    });
    return this.session(user);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { stats: true },
    });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.session(user);
  }

  async refresh(refreshToken: string) {
    const tokenHash = sha256(refreshToken);
    const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!row || row.revokedAt || row.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.prisma.refreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    });
    const user = await this.prisma.user.findUnique({
      where: { id: row.userId },
      include: { stats: true },
    });
    if (!user) throw new UnauthorizedException();
    return this.session(user);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: sha256(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { stats: true },
    });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName,
        avatarUrl: dto.avatarUrl,
        country: dto.country,
      },
      include: { stats: true },
    });
    return this.publicUser(user);
  }

  private async session(user: UserWithStats) {
    const tokens = await this.issueTokens(user.id);
    return { user: this.publicUser(user), ...tokens };
  }

  private async issueTokens(userId: string) {
    const accessToken = await this.jwt.signAsync({ sub: userId });
    const refreshToken = randomBytes(32).toString('hex');
    const days = Number(this.config.get('JWT_REFRESH_TTL_DAYS') ?? 30);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: sha256(refreshToken),
        expiresAt: new Date(Date.now() + days * 86_400_000),
      },
    });
    return { accessToken, refreshToken };
  }
}
