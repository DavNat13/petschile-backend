/*
  Warnings:

  - You are about to drop the column `brandId` on the `AttributeAlimento` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AttributeAccesorio" DROP CONSTRAINT "AttributeAccesorio_productId_fkey";

-- DropForeignKey
ALTER TABLE "AttributeAlimento" DROP CONSTRAINT "AttributeAlimento_brandId_fkey";

-- DropForeignKey
ALTER TABLE "AttributeAlimento" DROP CONSTRAINT "AttributeAlimento_productId_fkey";

-- DropForeignKey
ALTER TABLE "AttributeHigiene" DROP CONSTRAINT "AttributeHigiene_productId_fkey";

-- DropForeignKey
ALTER TABLE "AttributeJuguete" DROP CONSTRAINT "AttributeJuguete_productId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_userId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productId_fkey";

-- AlterTable
ALTER TABLE "AttributeAlimento" DROP COLUMN "brandId";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brandId" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "MediaFile" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaFile_publicId_key" ON "MediaFile"("publicId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeAlimento" ADD CONSTRAINT "AttributeAlimento_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeJuguete" ADD CONSTRAINT "AttributeJuguete_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeAccesorio" ADD CONSTRAINT "AttributeAccesorio_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributeHigiene" ADD CONSTRAINT "AttributeHigiene_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
