-- CreateTable
CREATE TABLE "UrlShortener" (
    "original_url" TEXT NOT NULL,
    "hashed_url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UrlShortener_original_url_key" ON "UrlShortener"("original_url");

-- CreateIndex
CREATE UNIQUE INDEX "UrlShortener_hashed_url_key" ON "UrlShortener"("hashed_url");
