-- CreateTable
CREATE TABLE "ClickEvent" (
    "id" TEXT NOT NULL,
    "shortener_url_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClickEvent_shortener_url_id_createdAt_idx" ON "ClickEvent"("shortener_url_id", "createdAt");

-- AddForeignKey
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_shortener_url_id_fkey" FOREIGN KEY ("shortener_url_id") REFERENCES "UrlShortener"("hashed_url") ON DELETE CASCADE ON UPDATE CASCADE;
