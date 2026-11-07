-- DropForeignKey
ALTER TABLE "ClickEvent" DROP CONSTRAINT "ClickEvent_shortener_url_id_fkey";

-- DropIndex
DROP INDEX IF EXISTS "UrlShortener_hashed_url_idx";

-- DropIndex
DROP INDEX IF EXISTS "UrlShortener_hashed_url_key";

-- AddForeignKey
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_shortener_url_id_fkey" FOREIGN KEY ("shortener_url_id") REFERENCES "UrlShortener"("hashed_url") ON DELETE CASCADE ON UPDATE CASCADE;
