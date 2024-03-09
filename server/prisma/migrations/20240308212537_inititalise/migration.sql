/*
  Warnings:

  - You are about to alter the column `created_at` on the `cheets` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `cheets` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `createdAt` on the `replies` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `replies` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `cheets` MODIFY `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updatedAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();

-- AlterTable
ALTER TABLE `replies` MODIFY `createdAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(),
    MODIFY `updatedAt` DATETIME NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP();
