<?php

namespace app\commands;

use Yii;
use yii\console\Controller;
use yii\console\ExitCode;
use app\models\MasterData;
use app\models\MasterWilayah;
use app\models\UserRole;
use app\models\RolePermission;
use app\models\User;
use app\models\Pegawai;
use app\models\PegawaiPendidikan;
use app\models\Activities;

class SeederController extends Controller
{
    /**
     * Run all seeders in order
     */
    public function actionIndex()
    {
        echo "Starting seed...\n";

        $this->actionMasterData();
        $this->actionMasterWilayah();
        $this->actionUserRole();
        $this->actionRolePermission();
        $this->actionUser();
        $this->actionPegawai();
        $this->actionPegawaiPendidikan();
        $this->actionActivities();

        echo "All seeders completed!\n";
        return ExitCode::OK;
    }

    /**
     * Seed master_data (jabatan & departemen)
     */
    public function actionMasterData()
    {
        $data = [
            ['nama' => 'Manager', 'tipe' => 'jabatan'],
            ['nama' => 'Staf', 'tipe' => 'jabatan'],
            ['nama' => 'Magang', 'tipe' => 'jabatan'],
            ['nama' => 'Marketing', 'tipe' => 'departemen'],
            ['nama' => 'HRD', 'tipe' => 'departemen'],
            ['nama' => 'Production', 'tipe' => 'departemen'],
            ['nama' => 'Executive', 'tipe' => 'departemen'],
            ['nama' => 'Commissioner', 'tipe' => 'departemen'],
        ];

        foreach ($data as $row) {
            $model = new MasterData();
            $model->attributes = $row;
            $model->save(false);
        }

        echo "master_data seeded: " . count($data) . " rows\n";
    }

    /**
     * Seed master_wilayah
     */
    public function actionMasterWilayah()
    {
        $data = [
            ['kecamatan' => 'Cempaka Putih', 'kabupaten' => 'Jakarta Pusat', 'provinsi' => 'DKI Jakarta'],
            ['kecamatan' => 'Johar Baru', 'kabupaten' => 'Jakarta Pusat', 'provinsi' => 'DKI Jakarta'],
            ['kecamatan' => 'Kemayoran', 'kabupaten' => 'Jakarta Pusat', 'provinsi' => 'DKI Jakarta'],
            ['kecamatan' => 'Sawah Besar', 'kabupaten' => 'Jakarta Pusat', 'provinsi' => 'DKI Jakarta'],
            ['kecamatan' => 'Senen', 'kabupaten' => 'Jakarta Pusat', 'provinsi' => 'DKI Jakarta'],
            ['kecamatan' => 'Tanah Abang', 'kabupaten' => 'Jakarta Pusat', 'provinsi' => 'DKI Jakarta'],
            ['kecamatan' => 'Menteng', 'kabupaten' => 'Jakarta Pusat', 'provinsi' => 'DKI Jakarta'],
            ['kecamatan' => 'Gambir', 'kabupaten' => 'Jakarta Pusat', 'provinsi' => 'DKI Jakarta'],
            ['kecamatan' => 'Kebon Jeruk', 'kabupaten' => 'Jakarta Barat', 'provinsi' => 'DKI Jakarta'],
            ['kecamatan' => 'Kebayoran Baru', 'kabupaten' => 'Jakarta Selatan', 'provinsi' => 'DKI Jakarta'],
        ];

        foreach ($data as $row) {
            $model = new MasterWilayah();
            $model->attributes = $row;
            $model->save(false);
        }

        echo "master_wilayah seeded: " . count($data) . " rows\n";
    }

    /**
     * Seed user_role
     */
    public function actionUserRole()
    {
        $data = [
            ['nama_role' => 'Superadmin'],
            ['nama_role' => 'Manager HRD'],
            ['nama_role' => 'Admin HRD'],
        ];

        foreach ($data as $row) {
            $model = new UserRole();
            $model->attributes = $row;
            $model->save(false);
        }

        echo "user_role seeded: " . count($data) . " rows\n";
    }

    /**
     * Seed role_permission
     * 
     * Permission mapping :
     * - akses=1         -> role punya akses ke modul
     * - create/update   -> tinyint(1): 1=allowed, 0=denied
     * - read            -> ENUM: 'All'=baca semua, 'Own'=baca sendiri, 'No'=tidak bisa baca
     * - delete          -> tinyint(1): 1=allowed, 0=denied
     */
    public function actionRolePermission()
    {
        $permissions = [
            // Superadmin (id_role=1)
            1 => [
                'kelola_role'                 => ['akses' => 1, 'create' => 0, 'read' => 'All', 'update' => 0, 'delete' => 0],
                'kelola_user'                 => ['akses' => 1, 'create' => 1, 'read' => 'All', 'update' => 1, 'delete' => 1],
                'my_profile'                  => ['akses' => 1, 'create' => 0, 'read' => 'All', 'update' => 1, 'delete' => 0],
                'dashboard'                   => ['akses' => 1, 'create' => 0, 'read' => 'All', 'update' => 0, 'delete' => 0],
                'modul_pegawai'               => ['akses' => 0, 'create' => 0, 'read' => 'No',  'update' => 0, 'delete' => 0],
                'modul_tunjangan_transport'   => ['akses' => 0, 'create' => 0, 'read' => 'No',  'update' => 0, 'delete' => 0],
                'setting_tunjangan_transport' => ['akses' => 0, 'create' => 0, 'read' => 'No',  'update' => 0, 'delete' => 0],
                'modul_log'                   => ['akses' => 1, 'create' => 0, 'read' => 'All', 'update' => 0, 'delete' => 0],
            ],
            // Manager HRD (id_role=2)
            2 => [
                'kelola_role'                 => ['akses' => 0, 'create' => 0, 'read' => 'No',  'update' => 0, 'delete' => 0],
                'kelola_user'                 => ['akses' => 0, 'create' => 0, 'read' => 'No',  'update' => 0, 'delete' => 0],
                'my_profile'                  => ['akses' => 1, 'create' => 0, 'read' => 'All', 'update' => 1, 'delete' => 0],
                'dashboard'                   => ['akses' => 1, 'create' => 0, 'read' => 'All', 'update' => 0, 'delete' => 0],
                'modul_pegawai'               => ['akses' => 1, 'create' => 0, 'read' => 'All', 'update' => 0, 'delete' => 0],
                'modul_tunjangan_transport'   => ['akses' => 1, 'create' => 0, 'read' => 'All', 'update' => 0, 'delete' => 0],
                'setting_tunjangan_transport'  => ['akses' => 0, 'create' => 0, 'read' => 'No',  'update' => 0, 'delete' => 0],
                'modul_log'                   => ['akses' => 0, 'create' => 0, 'read' => 'No',  'update' => 0, 'delete' => 0],
            ],
            // Admin HRD (id_role=3)
            3 => [
                'kelola_role'                 => ['akses' => 0, 'create' => 0, 'read' => 'No',  'update' => 0, 'delete' => 0],
                'kelola_user'                 => ['akses' => 0, 'create' => 0, 'read' => 'No',  'update' => 0, 'delete' => 0],
                'my_profile'                  => ['akses' => 1, 'create' => 0, 'read' => 'All', 'update' => 1, 'delete' => 0],
                'dashboard'                   => ['akses' => 1, 'create' => 0, 'read' => 'All', 'update' => 0, 'delete' => 0],
                'modul_pegawai'               => ['akses' => 1, 'create' => 1, 'read' => 'All', 'update' => 1, 'delete' => 1],
                'modul_tunjangan_transport'   => ['akses' => 1, 'create' => 0, 'read' => 'All', 'update' => 0, 'delete' => 0],
                'setting_tunjangan_transport' => ['akses' => 1, 'create' => 1, 'read' => 'All', 'update' => 1, 'delete' => 1],
                'modul_log'                   => ['akses' => 0, 'create' => 0, 'read' => 'No',  'update' => 0, 'delete' => 0],
            ],
        ];

        $count = 0;
        foreach ($permissions as $roleId => $moduls) {
            foreach ($moduls as $modul => $perms) {
                $model = new RolePermission();
                $model->id_role = $roleId;
                $model->modul_fitur = $modul;
                $model->attributes = $perms;
                $model->save(false);
                $count++;
            }
        }

        echo "role_permission seeded: " . $count . " rows\n";
    }

    /**
     * Seed user (default users per role)
     */
    public function actionUser()
    {
        $data = [
            [
                'id_role' => 1,
                'username' => 'superadmin',
                'password_hash' => Yii::$app->security->generatePasswordHash('superadmin123'),
                'nama' => 'Superadmin',
                'email' => 'superadmin@kepegawaian.go.id',
                'disabled' => 0,
            ],
            [
                'id_role' => 2,
                'username' => 'manager_hrd',
                'password_hash' => Yii::$app->security->generatePasswordHash('manager123'),
                'nama' => 'Agus Prasetyo',
                'email' => 'agus.prasetyo@kepegawaian.go.id',
                'disabled' => 0,
            ],
            [
                'id_role' => 3,
                'username' => 'admin_hrd',
                'password_hash' => Yii::$app->security->generatePasswordHash('adminhrd123'),
                'nama' => 'Rina Marlina',
                'email' => 'rina.marlina@kepegawaian.go.id',
                'disabled' => 0,
            ],
        ];

        foreach ($data as $row) {
            $model = new User();
            $model->attributes = $row;
            $model->save(false);
        }

        echo "user seeded: " . count($data) . " rows\n";
    }

    /**
     * Seed pegawai
     */
    public function actionPegawai()
    {
        $data = [
            [
                'nip' => '198501012010011001',
                'nama_pegawai' => 'Ahmad Fauzi',
                'email' => 'ahmad.fauzi@kepegawaian.go.id',
                'nomor_hp' => '081234567890',
                'tempat_lahir' => 'Jakarta',
                'id_kecamatan' => 1,
                'alamat_lengkap' => 'Jl. Merdeka No. 10, Cempaka Putih',
                'jarak_rumah_kantor' => 5,
                'tanggal_lahir' => '1985-01-01',
                'status_kawin' => 'kawin',
                'jumlah_anak' => 2,
                'tanggal_masuk' => '2010-01-15',
                'id_jabatan' => 1,  // Manager
                'id_departemen' => 9, // Sekretariat
                'usia' => 41,
                'status' => 'Aktif',
            ],
            [
                'nip' => '199002152012022001',
                'nama_pegawai' => 'Rina Marlina',
                'email' => 'rina.marlina@kepegawaian.go.id',
                'nomor_hp' => '081234567891',
                'tempat_lahir' => 'Bandung',
                'id_kecamatan' => 3,
                'alamat_lengkap' => 'Jl. Kemayoran Jaya No. 25',
                'jarak_rumah_kantor' => 8,
                'tanggal_lahir' => '1990-02-15',
                'status_kawin' => 'kawin',
                'jumlah_anak' => 1,
                'tanggal_masuk' => '2012-02-20',
                'id_jabatan' => 1,  // Manager
                'id_departemen' => 11, // Bagian Keuangan
                'usia' => 36,
                'status' => 'Aktif',
            ],
            [
                'nip' => '199208302015032002',
                'nama_pegawai' => 'Budi Santoso',
                'email' => 'budi.santoso@kepegawaian.go.id',
                'nomor_hp' => '081234567892',
                'tempat_lahir' => 'Surabaya',
                'id_kecamatan' => 5,
                'alamat_lengkap' => 'Jl. Senen Raya No. 88',
                'jarak_rumah_kantor' => 3,
                'tanggal_lahir' => '1992-08-30',
                'status_kawin' => 'tidak kawin',
                'jumlah_anak' => 0,
                'tanggal_masuk' => '2015-03-10',
                'id_jabatan' => 2,  // Staf
                'id_departemen' => 10, // Bagian Umum
                'usia' => 33,
                'status' => 'Aktif',
            ],
            [
                'nip' => '198811112013011003',
                'nama_pegawai' => 'Dewi Lestari',
                'email' => 'dewi.lestari@kepegawaian.go.id',
                'nomor_hp' => '081234567893',
                'tempat_lahir' => 'Yogyakarta',
                'id_kecamatan' => 8,
                'alamat_lengkap' => 'Jl. Gambir No. 5',
                'jarak_rumah_kantor' => 2,
                'tanggal_lahir' => '1988-11-11',
                'status_kawin' => 'kawin',
                'jumlah_anak' => 3,
                'tanggal_masuk' => '2013-01-05',
                'id_jabatan' => 2,  // Staf
                'id_departemen' => 9, // Sekretariat
                'usia' => 37,
                'status' => 'Aktif',
            ],
            [
                'nip' => '199506202018012004',
                'nama_pegawai' => 'Siti Aminah',
                'email' => 'siti.aminah@kepegawaian.go.id',
                'nomor_hp' => '081234567894',
                'tempat_lahir' => 'Semarang',
                'id_kecamatan' => 6,
                'alamat_lengkap' => 'Jl. Tanah Abang No. 12',
                'jarak_rumah_kantor' => 6,
                'tanggal_lahir' => '1995-06-20',
                'status_kawin' => 'tidak kawin',
                'jumlah_anak' => 0,
                'tanggal_masuk' => '2018-01-20',
                'id_jabatan' => 3,  // Magang
                'id_departemen' => 11, // Bagian Keuangan
                'usia' => 31,
                'status' => 'Aktif',
            ],
        ];

        foreach ($data as $row) {
            $model = new Pegawai();
            $model->attributes = $row;
            $model->save(false);
        }

        echo "pegawai seeded: " . count($data) . " rows\n";
    }

    /**
     * Seed pegawai_pendidikan
     */
    public function actionPegawaiPendidikan()
    {
        $data = [
            ['id_pegawai' => 1, 'tingkat_pendidikan' => 'SD', 'nama_sekolah' => 'SD Negeri 01 Jakarta', 'tahun_lulus' => 1997],
            ['id_pegawai' => 1, 'tingkat_pendidikan' => 'SMP', 'nama_sekolah' => 'SMP Negeri 10 Jakarta', 'tahun_lulus' => 2000],
            ['id_pegawai' => 1, 'tingkat_pendidikan' => 'SMA', 'nama_sekolah' => 'SMA Negeri 01 Jakarta', 'tahun_lulus' => 2003],
            ['id_pegawai' => 1, 'tingkat_pendidikan' => 'S1', 'nama_sekolah' => 'Universitas Indonesia', 'tahun_lulus' => 2007],
            ['id_pegawai' => 1, 'tingkat_pendidikan' => 'S2', 'nama_sekolah' => 'Universitas Indonesia', 'tahun_lulus' => 2010],
            ['id_pegawai' => 2, 'tingkat_pendidikan' => 'SD', 'nama_sekolah' => 'SD Negeri 05 Bandung', 'tahun_lulus' => 2000],
            ['id_pegawai' => 2, 'tingkat_pendidikan' => 'SMP', 'nama_sekolah' => 'SMP Negeri 08 Bandung', 'tahun_lulus' => 2003],
            ['id_pegawai' => 2, 'tingkat_pendidikan' => 'SMA', 'nama_sekolah' => 'SMA Negeri 03 Bandung', 'tahun_lulus' => 2006],
            ['id_pegawai' => 2, 'tingkat_pendidikan' => 'S1', 'nama_sekolah' => 'Universitas Padjadjaran', 'tahun_lulus' => 2010],
            ['id_pegawai' => 5, 'tingkat_pendidikan' => 'SD', 'nama_sekolah' => 'SD Negeri 12 Semarang', 'tahun_lulus' => 2005],
            ['id_pegawai' => 5, 'tingkat_pendidikan' => 'SMP', 'nama_sekolah' => 'SMP Negeri 07 Semarang', 'tahun_lulus' => 2008],
            ['id_pegawai' => 5, 'tingkat_pendidikan' => 'SMA', 'nama_sekolah' => 'SMA Negeri 02 Semarang', 'tahun_lulus' => 2011],
            ['id_pegawai' => 5, 'tingkat_pendidikan' => 'S1', 'nama_sekolah' => 'Universitas Diponegoro', 'tahun_lulus' => 2015],
        ];

        foreach ($data as $row) {
            $model = new PegawaiPendidikan();
            $model->attributes = $row;
            $model->save(false);
        }

        echo "pegawai_pendidikan seeded: " . count($data) . " rows\n";
    }

    /**
     * Seed activities
     */
    public function actionActivities()
    {
        $data = [
            [
                'title' => 'Login Aplikasi',
                'content' => 'User melakukan login ke sistem',
                'ua' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'ip' => '127.0.0.1',
                'url' => '/site/login',
                'browser' => 'Chrome',
                'platform' => 'Windows',
                'created_by' => 1,
            ],
            [
                'title' => 'Tambah Pegawai',
                'content' => 'Menambah data pegawai baru: Ahmad Fauzi',
                'ua' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'ip' => '127.0.0.1',
                'url' => '/pegawai/create',
                'browser' => 'Chrome',
                'platform' => 'Windows',
                'created_by' => 1,
            ],
            [
                'title' => 'Update Data Jabatan',
                'content' => 'Mengubah data jabatan Kepala Dinas',
                'ua' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'ip' => '127.0.0.1',
                'url' => '/master-data/update?id=1',
                'browser' => 'Firefox',
                'platform' => 'Windows',
                'created_by' => 1,
            ],
        ];

        foreach ($data as $row) {
            $model = new Activities();
            $model->attributes = $row;
            $model->save(false);
        }

        echo "activities seeded: " . count($data) . " rows\n";
    }

    /**
     * Truncate all tables (reset seed)
     */
    public function actionFlush()
    {
        Yii::$app->db->createCommand()->truncateTable('{{%activities}}')->execute();
        Yii::$app->db->createCommand()->truncateTable('{{%user}}')->execute();
        Yii::$app->db->createCommand()->truncateTable('{{%role_permission}}')->execute();
        Yii::$app->db->createCommand()->truncateTable('{{%user_role}}')->execute();
        Yii::$app->db->createCommand()->truncateTable('{{%pegawai_pendidikan}}')->execute();
        Yii::$app->db->createCommand()->truncateTable('{{%pegawai}}')->execute();
        Yii::$app->db->createCommand()->truncateTable('{{%master_wilayah}}')->execute();
        Yii::$app->db->createCommand()->truncateTable('{{%master_data}}')->execute();

        echo "All tables truncated.\n";
    }
}
