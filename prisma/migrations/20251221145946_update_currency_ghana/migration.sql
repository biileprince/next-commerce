/*
  Warnings:

  - You are about to drop the column `lga` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `addresses` table. All the data in the column will be lost.
  - Added the required column `region` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: First rename state to region to preserve data
ALTER TABLE "addresses" RENAME COLUMN "state" TO "region";

-- AlterTable: Then rename lga to district
ALTER TABLE "addresses" RENAME COLUMN "lga" TO "district";

-- AlterTable: Update currency defaults
ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'GHS';
ALTER TABLE "products" ALTER COLUMN "currency" SET DEFAULT 'GHS';

-- Update existing products to use GHS
UPDATE "products" SET "currency" = 'GHS' WHERE "currency" = 'NGN';

-- Update existing orders to use GHS
UPDATE "orders" SET "currency" = 'GHS' WHERE "currency" = 'NGN';
