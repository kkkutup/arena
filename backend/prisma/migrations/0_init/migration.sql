-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'APPLE');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "CompetitionType" AS ENUM ('PRIVATE_LEAGUE', 'DUEL', 'PUBLIC_DIVISION');

-- CreateEnum
CREATE TYPE "CompetitionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'SETTLING', 'FINISHED');

-- CreateEnum
CREATE TYPE "PositionSide" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "PositionStatus" AS ENUM ('OPEN', 'CLOSED', 'LIQUIDATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "username" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthIdentity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "device" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileStats" (
    "userId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "competitionsPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileStats_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "addresseeId" TEXT NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Instrument" (
    "symbol" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "base" TEXT NOT NULL,
    "pricePrecision" INTEGER NOT NULL DEFAULT 2,
    "qtyStep" DOUBLE PRECISION NOT NULL DEFAULT 0.0001,
    "maxLeverage" INTEGER NOT NULL DEFAULT 100,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Instrument_pkey" PRIMARY KEY ("symbol")
);

-- CreateTable
CREATE TABLE "Competition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CompetitionType" NOT NULL,
    "creatorId" TEXT,
    "instruments" TEXT[],
    "startingBalance" DOUBLE PRECISION NOT NULL DEFAULT 100000,
    "maxLeverage" INTEGER NOT NULL DEFAULT 20,
    "joinCode" TEXT,
    "maxParticipants" INTEGER,
    "status" "CompetitionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participation" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cashBalance" DOUBLE PRECISION NOT NULL,
    "finalRank" INTEGER,
    "finalEquity" DOUBLE PRECISION,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" "PositionSide" NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "leverage" INTEGER NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "margin" DOUBLE PRECISION NOT NULL,
    "liquidationPrice" DOUBLE PRECISION NOT NULL,
    "status" "PositionStatus" NOT NULL DEFAULT 'OPEN',
    "closePrice" DOUBLE PRECISION,
    "realizedPnl" DOUBLE PRECISION,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "AuthIdentity_userId_idx" ON "AuthIdentity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthIdentity_provider_providerUserId_key" ON "AuthIdentity"("provider", "providerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "Friendship_addresseeId_status_idx" ON "Friendship"("addresseeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_requesterId_addresseeId_key" ON "Friendship"("requesterId", "addresseeId");

-- CreateIndex
CREATE UNIQUE INDEX "Competition_joinCode_key" ON "Competition"("joinCode");

-- CreateIndex
CREATE INDEX "Competition_status_endAt_idx" ON "Competition"("status", "endAt");

-- CreateIndex
CREATE INDEX "Participation_userId_idx" ON "Participation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Participation_competitionId_userId_key" ON "Participation"("competitionId", "userId");

-- CreateIndex
CREATE INDEX "Position_participationId_status_idx" ON "Position"("participationId", "status");

-- CreateIndex
CREATE INDEX "AdminLog_createdAt_idx" ON "AdminLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AuthIdentity" ADD CONSTRAINT "AuthIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileStats" ADD CONSTRAINT "ProfileStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "Participation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

