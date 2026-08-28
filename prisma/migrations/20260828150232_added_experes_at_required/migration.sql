/*
  Warnings:

  - Made the column `expiresAt` on table `UrlShortener` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UrlShortener" ALTER COLUMN "expiresAt" SET NOT NULL,
ADD CONSTRAINT "UrlShortener_pkey" PRIMARY KEY ("hashed_url");
