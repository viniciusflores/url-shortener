-- CreateIndex
CREATE INDEX "UrlShortener_original_url_idx" ON "UrlShortener" USING HASH ("original_url");
