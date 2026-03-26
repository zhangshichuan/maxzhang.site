-- CreateTable
CREATE TABLE "PostView" (
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("slug", "locale")
);

-- CreateTable
CREATE TABLE "ViewLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fingerprint" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ViewLog_fingerprint_slug_locale_idx" ON "ViewLog"("fingerprint", "slug", "locale");
