import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding database...');

  await prisma.masterData.createMany({
    data: [
      { id: 1, nama: 'Manager', tipe: 'jabatan' },
      { id: 2, nama: 'Staf', tipe: 'jabatan' },
      { id: 3, nama: 'Magang', tipe: 'jabatan' },
      { id: 4, nama: 'Marketing', tipe: 'departemen' },
      { id: 5, nama: 'HRD', tipe: 'departemen' },
      { id: 6, nama: 'Production', tipe: 'departemen' },
      { id: 7, nama: 'Executive', tipe: 'departemen' },
      { id: 8, nama: 'Commissioner', tipe: 'departemen' },
      { id: 9, nama: 'Sekretariat', tipe: 'departemen' },
      { id: 10, nama: 'Bagian Umum', tipe: 'departemen' },
      { id: 11, nama: 'Bagian Keuangan', tipe: 'departemen' },
    ],
    skipDuplicates: true,
  });
  console.log('Master Data seed done');

  await prisma.masterWilayah.createMany({
    data: [
      { id: 1, kecamatan: 'Cempaka Putih', kabupaten: 'Jakarta Pusat', provinsi: 'DKI Jakarta' },
      { id: 2, kecamatan: 'Johar Baru', kabupaten: 'Jakarta Pusat', provinsi: 'DKI Jakarta' },
      { id: 3, kecamatan: 'Kemayoran', kabupaten: 'Jakarta Pusat', provinsi: 'DKI Jakarta' },
      { id: 4, kecamatan: 'Sawah Besar', kabupaten: 'Jakarta Pusat', provinsi: 'DKI Jakarta' },
      { id: 5, kecamatan: 'Senen', kabupaten: 'Jakarta Pusat', provinsi: 'DKI Jakarta' },
      { id: 6, kecamatan: 'Tanah Abang', kabupaten: 'Jakarta Pusat', provinsi: 'DKI Jakarta' },
      { id: 7, kecamatan: 'Menteng', kabupaten: 'Jakarta Pusat', provinsi: 'DKI Jakarta' },
      { id: 8, kecamatan: 'Gambir', kabupaten: 'Jakarta Pusat', provinsi: 'DKI Jakarta' },
      { id: 9, kecamatan: 'Kebon Jeruk', kabupaten: 'Jakarta Barat', provinsi: 'DKI Jakarta' },
      { id: 10, kecamatan: 'Kebayoran Baru', kabupaten: 'Jakarta Selatan', provinsi: 'DKI Jakarta' },
    ],
    skipDuplicates: true,
  });
  console.log('Master wilayah seed done');

  await prisma.userRole.createMany({
    data: [
      { id: 1, nama_role: 'Superadmin' },
      { id: 2, nama_role: 'Manager HRD' },
      { id: 3, nama_role: 'Admin HRD' },
    ],
    skipDuplicates: true,
  });
  console.log('Role seed done');

  const permissions = [
    // Superadmin
    { id_role: 1, modul_fitur: 'kelola_role', akses: 1, create: 0, read: 'All', update: 'No', delete: 'No' },
    { id_role: 1, modul_fitur: 'kelola_user', akses: 1, create: 1, read: 'All', update: 'All', delete: 'All' },
    { id_role: 1, modul_fitur: 'my_profile', akses: 1, create: 0, read: 'Own', update: 'Own', delete: 'No' },
    { id_role: 1, modul_fitur: 'dashboard', akses: 1, create: 0, read: 'All', update: 'No', delete: 'No' },
    { id_role: 1, modul_fitur: 'modul_pegawai', akses: 0, create: 0, read: 'No', update: 'No', delete: 'No' },
    { id_role: 1, modul_fitur: 'modul_tunjangan_transport', akses: 0, create: 0, read: 'No', update: 'No', delete: 'No' },
    { id_role: 1, modul_fitur: 'setting_tunjangan_transport', akses: 0, create: 0, read: 'No', update: 'No', delete: 'No' },
    { id_role: 1, modul_fitur: 'modul_log', akses: 1, create: 0, read: 'All', update: 'No', delete: 'No' },
    
    // Manager HRD
    { id_role: 2, modul_fitur: 'kelola_role', akses: 0, create: 0, read: 'No', update: 'No', delete: 'No' },
    { id_role: 2, modul_fitur: 'kelola_user', akses: 0, create: 0, read: 'No', update: 'No', delete: 'No' },
    { id_role: 2, modul_fitur: 'my_profile', akses: 1, create: 0, read: 'Own', update: 'Own', delete: 'No' },
    { id_role: 2, modul_fitur: 'dashboard', akses: 1, create: 0, read: 'All', update: 'No', delete: 'No' },
    { id_role: 2, modul_fitur: 'modul_pegawai', akses: 1, create: 0, read: 'All', update: 'No', delete: 'No' },
    { id_role: 2, modul_fitur: 'modul_tunjangan_transport', akses: 1, create: 0, read: 'All', update: 'No', delete: 'No' },
    { id_role: 2, modul_fitur: 'setting_tunjangan_transport', akses: 0, create: 0, read: 'No', update: 'No', delete: 'No' },
    { id_role: 2, modul_fitur: 'modul_log', akses: 0, create: 0, read: 'No', update: 'No', delete: 'No' },
    
    // Admin HRD
    { id_role: 3, modul_fitur: 'kelola_role', akses: 0, create: 0, read: 'No', update: 'No', delete: 'No' },
    { id_role: 3, modul_fitur: 'kelola_user', akses: 0, create: 0, read: 'No', update: 'No', delete: 'No' },
    { id_role: 3, modul_fitur: 'my_profile', akses: 1, create: 0, read: 'Own', update: 'Own', delete: 'No' },
    { id_role: 3, modul_fitur: 'dashboard', akses: 1, create: 0, read: 'All', update: 'No', delete: 'No' },
    { id_role: 3, modul_fitur: 'modul_pegawai', akses: 1, create: 1, read: 'All', update: 'All', delete: 'All' },
    { id_role: 3, modul_fitur: 'modul_tunjangan_transport', akses: 1, create: 0, read: 'All', update: 'No', delete: 'No' },
    { id_role: 3, modul_fitur: 'setting_tunjangan_transport', akses: 1, create: 1, read: 'All', update: 'All', delete: 'All' },
    { id_role: 3, modul_fitur: 'modul_log', akses: 0, create: 0, read: 'No', update: 'No', delete: 'No' },
  ];
  await prisma.rolePermission.createMany({ data: permissions, skipDuplicates: true });
  console.log('role permission seed done');

  await prisma.pegawai.createMany({
    data: [
      { id: 1, nip: '198501012010011001', nama_pegawai: 'Ahmad Fauzi', email: 'ahmad.fauzi@kepegawaian.go.id', nomor_hp: '081234567890', tempat_lahir: 'Jakarta', id_kecamatan: 1, alamat_lengkap: 'Jl. Merdeka No. 10, Cempaka Putih', jarak_rumah_kantor: 5, tanggal_lahir: new Date('1985-01-01'), status_kawin: 'Kawin', jumlah_anak: 2, tanggal_masuk: new Date('2010-01-15'), id_jabatan: 1, id_departemen: 9, usia: 41, status: 'Aktif' },
      { id: 2, nip: '199002152012022001', nama_pegawai: 'Rina Marlina', email: 'rina.marlina@kepegawaian.go.id', nomor_hp: '081234567891', tempat_lahir: 'Bandung', id_kecamatan: 3, alamat_lengkap: 'Jl. Kemayoran Jaya No. 25', jarak_rumah_kantor: 8, tanggal_lahir: new Date('1990-02-15'), status_kawin: 'Kawin', jumlah_anak: 1, tanggal_masuk: new Date('2012-02-20'), id_jabatan: 1, id_departemen: 11, usia: 36, status: 'Aktif' },
      { id: 3, nip: '199208302015032002', nama_pegawai: 'Budi Santoso', email: 'budi.santoso@kepegawaian.go.id', nomor_hp: '081234567892', tempat_lahir: 'Surabaya', id_kecamatan: 5, alamat_lengkap: 'Jl. Senen Raya No. 88', jarak_rumah_kantor: 3, tanggal_lahir: new Date('1992-08-30'), status_kawin: 'tidak_kawin', jumlah_anak: 0, tanggal_masuk: new Date('2015-03-10'), id_jabatan: 2, id_departemen: 10, usia: 33, status: 'Aktif' },
      { id: 4, nip: '198811112013011003', nama_pegawai: 'Dewi Lestari', email: 'dewi.lestari@kepegawaian.go.id', nomor_hp: '081234567893', tempat_lahir: 'Yogyakarta', id_kecamatan: 8, alamat_lengkap: 'Jl. Gambir No. 5', jarak_rumah_kantor: 2, tanggal_lahir: new Date('1988-11-11'), status_kawin: 'Kawin', jumlah_anak: 3, tanggal_masuk: new Date('2013-01-05'), id_jabatan: 2, id_departemen: 9, usia: 37, status: 'Aktif' },
      { id: 5, nip: '199506202018012004', nama_pegawai: 'Siti Aminah', email: 'siti.aminah@kepegawaian.go.id', nomor_hp: '081234567894', tempat_lahir: 'Semarang', id_kecamatan: 6, alamat_lengkap: 'Jl. Tanah Abang No. 12', jarak_rumah_kantor: 6, tanggal_lahir: new Date('1995-06-20'), status_kawin: 'tidak_kawin', jumlah_anak: 0, tanggal_masuk: new Date('2018-01-20'), id_jabatan: 3, id_departemen: 11, usia: 31, status: 'Aktif' },
    ],
    skipDuplicates: true,
  });
  console.log('Pegawai seed done');

  await prisma.pegawaiPendidikan.createMany({
    data: [
      { id_pegawai: 1, tingkat_pendidikan: 'SD', nama_sekolah: 'SD Negeri 01 Jakarta', tahun_lulus: 1997 },
      { id_pegawai: 1, tingkat_pendidikan: 'SMP', nama_sekolah: 'SMP Negeri 10 Jakarta', tahun_lulus: 2000 },
      { id_pegawai: 1, tingkat_pendidikan: 'SMA', nama_sekolah: 'SMA Negeri 01 Jakarta', tahun_lulus: 2003 },
      { id_pegawai: 1, tingkat_pendidikan: 'S1', nama_sekolah: 'Universitas Indonesia', tahun_lulus: 2007 },
      { id_pegawai: 1, tingkat_pendidikan: 'S2', nama_sekolah: 'Universitas Indonesia', tahun_lulus: 2010 },
      { id_pegawai: 2, tingkat_pendidikan: 'SD', nama_sekolah: 'SD Negeri 05 Bandung', tahun_lulus: 2000 },
      { id_pegawai: 2, tingkat_pendidikan: 'SMP', nama_sekolah: 'SMP Negeri 08 Bandung', tahun_lulus: 2003 },
      { id_pegawai: 2, tingkat_pendidikan: 'SMA', nama_sekolah: 'SMA Negeri 03 Bandung', tahun_lulus: 2006 },
      { id_pegawai: 2, tingkat_pendidikan: 'S1', nama_sekolah: 'Universitas Padjadjaran', tahun_lulus: 2010 },
      { id_pegawai: 5, tingkat_pendidikan: 'SD', nama_sekolah: 'SD Negeri 12 Semarang', tahun_lulus: 2005 },
      { id_pegawai: 5, tingkat_pendidikan: 'SMP', nama_sekolah: 'SMP Negeri 07 Semarang', tahun_lulus: 2008 },
      { id_pegawai: 5, tingkat_pendidikan: 'SMA', nama_sekolah: 'SMA Negeri 02 Semarang', tahun_lulus: 2011 },
      { id_pegawai: 5, tingkat_pendidikan: 'S1', nama_sekolah: 'Universitas Diponegoro', tahun_lulus: 2015 },
    ],
    skipDuplicates: true,
  });
  console.log('Pendidikan pegawai seed done');

  const passwordSuperadmin = await bcrypt.hash('superadmin123', 10);
  const passwordManager = await bcrypt.hash('manager123', 10);
  const passwordAdmin = await bcrypt.hash('adminhrd123', 10);

  await prisma.user.createMany({
    data: [
      { id: 1, id_role: 1, username: 'superadmin', password_hash: passwordSuperadmin, nama: 'Superadmin', email: 'superadmin@kepegawaian.go.id', disabled: 0 },
      { id: 2, id_role: 2, username: 'manager_hrd', password_hash: passwordManager, nama: 'Agus Prasetyo', email: 'agus.prasetyo@kepegawaian.go.id', disabled: 0 },
      { id: 3, id_role: 3, username: 'admin_hrd', password_hash: passwordAdmin, nama: 'Rina Marlina', email: 'rina.marlina@kepegawaian.go.id', disabled: 0 },
    ],
    skipDuplicates: true,
  });
  console.log('User seed done');

  await prisma.activities.createMany({
    data: [
      { title: 'Login Aplikasi', content: 'User melakukan login ke sistem', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', ip: '127.0.0.1', url: '/site/login', browser: 'Chrome', platform: 'Windows', created_by: 1 },
      { title: 'Tambah Pegawai', content: 'Menambah data pegawai baru: Ahmad Fauzi', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', ip: '127.0.0.1', url: '/pegawai/create', browser: 'Chrome', platform: 'Windows', created_by: 1 },
      { title: 'Update Data Jabatan', content: 'Mengubah data jabatan Kepala Dinas', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', ip: '127.0.0.1', url: '/master-data/update?id=1', browser: 'Firefox', platform: 'Windows', created_by: 1 },
    ],
    skipDuplicates: true,
  });
  console.log('Activities seed done');

  console.log('All done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });