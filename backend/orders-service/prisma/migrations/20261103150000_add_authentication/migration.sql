ALTER TABLE "User"
  ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "refreshTokenHash" TEXT;
