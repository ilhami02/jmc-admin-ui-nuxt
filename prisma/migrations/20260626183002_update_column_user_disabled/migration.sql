/*
  Warnings:

  - You are about to drop the column `disable` on the `user` table. All the data in the column will be lost.
  - You are about to alter the column `last_login` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `disable`,
    ADD COLUMN `disabled` TINYINT NULL DEFAULT 0,
    MODIFY `last_login` TIMESTAMP NULL;
