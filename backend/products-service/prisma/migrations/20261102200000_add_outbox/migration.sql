CREATE TABLE "OutboxEvent" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "deadLetteredAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OutboxEvent_publishedAt_deadLetteredAt_availableAt_lockedUntil_idx"
ON "OutboxEvent"("publishedAt", "deadLetteredAt", "availableAt", "lockedUntil");
