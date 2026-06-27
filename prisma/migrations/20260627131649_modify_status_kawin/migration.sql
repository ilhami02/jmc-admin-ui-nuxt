/*
  Warnings:

  - The values [kawin,tidak kawin] on the enum `pegawai_status_kawin` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `last_login` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `pegawai` MODIFY `status_kawin` ENUM('Kawin', 'Tidak Kawin') NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `last_login` TIMESTAMP NULL;
