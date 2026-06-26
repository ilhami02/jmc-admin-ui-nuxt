-- CreateTable
CREATE TABLE `master_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NULL,
    `tipe` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_wilayah` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kecamatan` VARCHAR(100) NULL,
    `kabupaten` VARCHAR(100) NULL,
    `provinsi` VARCHAR(100) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pegawai` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `foto_pegawai` VARCHAR(255) NULL,
    `nip` VARCHAR(30) NULL,
    `nama_pegawai` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `nomor_hp` VARCHAR(20) NULL,
    `tempat_lahir` VARCHAR(100) NULL,
    `id_kecamatan` INTEGER NULL,
    `alamat_lengkap` TEXT NULL,
    `jarak_rumah_kantor` TINYINT NULL,
    `tanggal_lahir` DATE NULL,
    `status_kawin` ENUM('kawin', 'tidak kawin') NULL,
    `jumlah_anak` TINYINT NULL DEFAULT 0,
    `tanggal_masuk` DATE NULL,
    `id_jabatan` INTEGER NULL,
    `id_departemen` INTEGER NULL,
    `usia` INTEGER NULL,
    `status` ENUM('Aktif', 'Nonaktif') NULL DEFAULT 'Aktif',
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `pegawai_nip_key`(`nip`),
    UNIQUE INDEX `pegawai_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pegawai_pendidikan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pegawai` INTEGER NULL,
    `tingkat_pendidikan` VARCHAR(50) NULL,
    `nama_sekolah` VARCHAR(255) NULL,
    `tahun_lulus` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_role` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_role` INTEGER NULL,
    `modul_fitur` VARCHAR(100) NULL,
    `akses` TINYINT NULL,
    `create` TINYINT NULL,
    `read` ENUM('All', 'Own', 'No') NOT NULL DEFAULT 'No',
    `update` ENUM('All', 'Own', 'No') NOT NULL DEFAULT 'No',
    `delete` ENUM('All', 'Own', 'No') NOT NULL DEFAULT 'No',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_role` INTEGER NULL,
    `id_pegawai` INTEGER NULL,
    `username` VARCHAR(100) NULL,
    `password_hash` VARCHAR(255) NULL,
    `nama` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `last_session` VARCHAR(255) NULL,
    `last_login` TIMESTAMP NULL,
    `updated_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `disable` TINYINT NULL DEFAULT 0,

    UNIQUE INDEX `user_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activities` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NULL,
    `content` TEXT NULL,
    `ua` VARCHAR(256) NULL,
    `ip` VARCHAR(64) NULL,
    `url` TEXT NULL,
    `browser` VARCHAR(64) NULL,
    `platform` VARCHAR(64) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `created_by` INTEGER NULL,
    `updated_by` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `setting_tunjangan_transport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tarif_per_km` DECIMAL(10, 2) NOT NULL,
    `berlaku_mulai` DATE NOT NULL,
    `min_kilometer` INTEGER NOT NULL,
    `max_kilometer` INTEGER NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tunjangan_transport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bulan` INTEGER NOT NULL,
    `tahun` INTEGER NOT NULL,
    `total_penerima` INTEGER NOT NULL DEFAULT 0,
    `total_tunjangan` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_tunjangan_transport` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_tunjangan` INTEGER NOT NULL,
    `id_pegawai` INTEGER NOT NULL,
    `kilometer` INTEGER NOT NULL,
    `jumlah_hari` INTEGER NOT NULL,
    `nominal` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pegawai` ADD CONSTRAINT `pegawai_id_jabatan_fkey` FOREIGN KEY (`id_jabatan`) REFERENCES `master_data`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pegawai` ADD CONSTRAINT `pegawai_id_departemen_fkey` FOREIGN KEY (`id_departemen`) REFERENCES `master_data`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pegawai` ADD CONSTRAINT `pegawai_id_kecamatan_fkey` FOREIGN KEY (`id_kecamatan`) REFERENCES `master_wilayah`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pegawai_pendidikan` ADD CONSTRAINT `pegawai_pendidikan_id_pegawai_fkey` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permission` ADD CONSTRAINT `role_permission_id_role_fkey` FOREIGN KEY (`id_role`) REFERENCES `user_role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_id_role_fkey` FOREIGN KEY (`id_role`) REFERENCES `user_role`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_id_pegawai_fkey` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activities` ADD CONSTRAINT `activities_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activities` ADD CONSTRAINT `activities_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_tunjangan_transport` ADD CONSTRAINT `detail_tunjangan_transport_id_tunjangan_fkey` FOREIGN KEY (`id_tunjangan`) REFERENCES `tunjangan_transport`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_tunjangan_transport` ADD CONSTRAINT `detail_tunjangan_transport_id_pegawai_fkey` FOREIGN KEY (`id_pegawai`) REFERENCES `pegawai`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
