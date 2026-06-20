import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type FriendStatus = 'FRIENDS' | 'PENDING_IN' | 'PENDING_OUT' | 'NONE';

type UserLite = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  stats: { level: number } | null;
};

export interface FriendDto {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  status: FriendStatus;
}

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  private toFriend(u: UserLite, status: FriendStatus): FriendDto {
    return {
      id: u.id,
      username: u.username,
      displayName: u.displayName ?? u.username,
      avatarUrl: u.avatarUrl,
      level: u.stats?.level ?? 1,
      status,
    };
  }

  async list(userId: string) {
    const links = await this.prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: userId }, { addresseeId: userId }],
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
      include: {
        requester: { include: { stats: true } },
        addressee: { include: { stats: true } },
      },
    });
    const friends = links.map((l) => {
      const other = l.requesterId === userId ? l.addressee : l.requester;
      const status: FriendStatus =
        l.status === 'ACCEPTED'
          ? 'FRIENDS'
          : l.requesterId === userId
            ? 'PENDING_OUT'
            : 'PENDING_IN';
      return this.toFriend(other, status);
    });
    return { friends };
  }

  async search(userId: string, q: string) {
    const term = q.trim();
    if (!term) return { friends: [] };
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        OR: [
          { username: { contains: term, mode: 'insensitive' } },
          { displayName: { contains: term, mode: 'insensitive' } },
        ],
      },
      include: { stats: true },
      take: 20,
    });
    const statuses = await this.statusMap(
      userId,
      users.map((u) => u.id),
    );
    return {
      friends: users.map((u) => this.toFriend(u, statuses[u.id] ?? 'NONE')),
    };
  }

  async suggested(userId: string) {
    const connected = await this.connectedIds(userId);
    const users = await this.prisma.user.findMany({
      where: { id: { notIn: [userId, ...connected] } },
      include: { stats: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return { friends: users.map((u) => this.toFriend(u, 'NONE')) };
  }

  async request(userId: string, targetId: string) {
    if (userId === targetId)
      throw new BadRequestException('Cannot add yourself');
    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!target) throw new NotFoundException('User not found');

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, addresseeId: targetId },
          { requesterId: targetId, addresseeId: userId },
        ],
      },
    });
    if (existing) {
      // A reverse pending request becomes a friendship (mutual add).
      if (existing.status === 'PENDING' && existing.addresseeId === userId) {
        await this.prisma.friendship.update({
          where: { id: existing.id },
          data: { status: 'ACCEPTED' },
        });
      }
      return this.list(userId);
    }
    await this.prisma.friendship.create({
      data: { requesterId: userId, addresseeId: targetId, status: 'PENDING' },
    });
    return this.list(userId);
  }

  async accept(userId: string, requesterId: string) {
    const link = await this.prisma.friendship.findUnique({
      where: { requesterId_addresseeId: { requesterId, addresseeId: userId } },
    });
    if (!link || link.status !== 'PENDING')
      throw new NotFoundException('No pending request');
    await this.prisma.friendship.update({
      where: { id: link.id },
      data: { status: 'ACCEPTED' },
    });
    return this.list(userId);
  }

  async remove(userId: string, otherId: string) {
    await this.prisma.friendship.deleteMany({
      where: {
        OR: [
          { requesterId: userId, addresseeId: otherId },
          { requesterId: otherId, addresseeId: userId },
        ],
      },
    });
    return this.list(userId);
  }

  private async connectedIds(userId: string): Promise<string[]> {
    const links = await this.prisma.friendship.findMany({
      where: { OR: [{ requesterId: userId }, { addresseeId: userId }] },
      select: { requesterId: true, addresseeId: true },
    });
    return links.map((l) =>
      l.requesterId === userId ? l.addresseeId : l.requesterId,
    );
  }

  private async statusMap(
    userId: string,
    ids: string[],
  ): Promise<Record<string, FriendStatus>> {
    const links = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, addresseeId: { in: ids } },
          { addresseeId: userId, requesterId: { in: ids } },
        ],
      },
    });
    const map: Record<string, FriendStatus> = {};
    for (const l of links) {
      const other = l.requesterId === userId ? l.addresseeId : l.requesterId;
      map[other] =
        l.status === 'ACCEPTED'
          ? 'FRIENDS'
          : l.requesterId === userId
            ? 'PENDING_OUT'
            : 'PENDING_IN';
    }
    return map;
  }
}
