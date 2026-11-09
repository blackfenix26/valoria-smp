CREATE TABLE "CommunityPhoto" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "blobPathname" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityPhoto_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityPhoto_blobPathname_key" ON "CommunityPhoto"("blobPathname");
CREATE INDEX "CommunityPhoto_status_createdAt_idx" ON "CommunityPhoto"("status", "createdAt");

ALTER TABLE "CommunityPhoto"
ADD CONSTRAINT "CommunityPhoto_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CommunityPhoto"
ADD CONSTRAINT "CommunityPhoto_reviewerId_fkey"
FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
