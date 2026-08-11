-- CreateTable
CREATE TABLE "PhotoWork" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "captionZh" TEXT NOT NULL,
    "captionEn" TEXT NOT NULL DEFAULT '',
    "takenAt" DATETIME NOT NULL,
    "location" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "coverIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PhotoWork_slug_key" ON "PhotoWork"("slug");

-- CreateIndex
CREATE INDEX "PhotoWork_takenAt_idx" ON "PhotoWork"("takenAt");

-- CreateTable
CREATE TABLE "Photo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workId" INTEGER NOT NULL,
    "sortIndex" INTEGER NOT NULL DEFAULT 0,
    "largeKey" TEXT NOT NULL,
    "thumbKey" TEXT NOT NULL,
    "largeUrl" TEXT NOT NULL,
    "thumbUrl" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "camera" TEXT,
    "lens" TEXT,
    "focal" TEXT,
    "aperture" TEXT,
    "shutter" TEXT,
    "iso" TEXT,
    CONSTRAINT "Photo_workId_fkey" FOREIGN KEY ("workId") REFERENCES "PhotoWork" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Photo_workId_idx" ON "Photo"("workId");
