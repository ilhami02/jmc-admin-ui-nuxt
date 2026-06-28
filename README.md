# Aplikasi Kepegawaian JMC

Aplikasi manajemen kepegawaian berbasis web menggunakan **Nuxt 4** (fullstack) dengan **Tabler UI** sebagai template admin dashboard.

---

## Tech Stack

| Layer       | Teknologi                                    |
|-------------|----------------------------------------------|
| Framework   | Nuxt 4 (Vue 3 + Nitro Server)                |
| UI Template | Tabler v1.0.0-beta24                         |
| Database    | MySQL                                        |
| ORM         | Prisma 6                                     |
| Auth        | JSON Web Token (jsonwebtoken) + bcryptjs      |
| Chart       | ApexCharts (vue3-apexcharts)                 |
| Export      | jsPDF, jspdf-autotable, xlsx                 |
| Icons       | @tabler/icons-vue                            |

---

## Prasyarat (Prerequisites)

Pastikan perangkat Anda sudah memiliki:

- **Node.js** v24.18.0 LTS — [Download Node.js](https://nodejs.org/)
- **MySQL** v5.7 atau lebih baru (bisa menggunakan XAMPP, Laragon, atau MySQL standalone)
- **Git** (opsional, untuk clone repository)

---

## Instalasi & Setup

### 1. Clone Repository

```bash
git clone <url-repository>
cd prototipe-jmc-admin-ui-nuxt
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Lalu edit file `.env` dan sesuaikan isinya:

```env
# Nama aplikasi (tampil di sidebar dan title)
APP_NAME=Kepegawaian_JMC
APP_CLIENT=JMC

# Google reCAPTCHA (untuk halaman login)
NUXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Koneksi Database MySQL
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/NAMA_DATABASE"

# Secret key untuk signing JWT
JWT_SECRET="your_jwt_secret_key"
```

**Penjelasan variabel:**

| Variabel                          | Keterangan                                                   |
|-----------------------------------|--------------------------------------------------------------|
| `APP_NAME`                        | Nama aplikasi yang tampil di UI                              |
| `APP_CLIENT`                      | Nama klien/instansi                                          |
| `NUXT_PUBLIC_RECAPTCHA_SITE_KEY`  | Site key reCAPTCHA v2 dari Google                            |
| `RECAPTCHA_SECRET_KEY`            | Secret key reCAPTCHA v2 dari Google                          |
| `DATABASE_URL`                    | Connection string MySQL dengan format Prisma                 |
| `JWT_SECRET`                      | Secret key untuk membuat dan memverifikasi token JWT         |

### 4. Setup Database

#### a. Buat database MySQL

Buat database baru di MySQL, misalnya `kepegawaian_jmc`:

```sql
CREATE DATABASE kepegawaian_jmc;
```

#### b. Sinkronisasi Schema ke Database

Jalankan perintah Prisma untuk membuat tabel-tabel sesuai schema:

```bash
npx prisma db push
```

#### c. Jalankan Seeder (Data Awal)

Isi database dengan data contoh (user, role, pegawai, dll):

```bash
npx prisma db seed
```

#### d. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Jalankan Aplikasi (Development)

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000).

### 6. Build untuk Production

```bash
npm run build
npm run preview
```

---

## Struktur Proyek

```
prototipe-jmc-admin-ui-nuxt/
├── app/                          # Frontend (Nuxt 4 app directory)
│   ├── assets/                   # CSS, gambar, SVG
│   │   ├── css/
│   │   └── images/
│   ├── composables/              # Vue composables (useTheme, dll)
│   ├── data/                     # Data statis (menu, dashboard dummy)
│   ├── features/                 # Komponen berdasarkan fitur
│   │   └── DataPegawai/
│   ├── layouts/                  # Layout (default, auth)
│   ├── middleware/                # Route middleware (auth guard)
│   ├── pages/                    # Halaman-halaman (file-based routing)
│   │   ├── (auth)/               # Halaman login
│   │   ├── pegawai/              # CRUD Pegawai
│   │   ├── user/                 # Manajemen User & Role
│   │   ├── tunjangan/            # Tunjangan Transport
│   │   ├── log/                  # Log Aktifitas
│   │   ├── profile/              # Profil User
│   │   └── index.vue             # Dashboard
│   ├── plugins/                  # Plugin (jQuery, Tabler, ApexCharts)
│   └── utils/                    # Utility functions (format tanggal, rupiah)
├── server/                       # Backend (Nitro server)
│   ├── api/                      # API endpoints
│   │   ├── auth/                 # Login, logout
│   │   ├── dashboard/            # Statistik dashboard
│   │   ├── log/                  # Log aktifitas
│   │   ├── master-data/          # Data jabatan, departemen
│   │   ├── pegawai/              # CRUD Pegawai
│   │   ├── tunjangan/            # CRUD & generate tunjangan
│   │   ├── user/                 # CRUD User & Role
│   │   └── wilayah/              # Data kecamatan/kabupaten
│   └── utils/                    # Server utilities (auth, logger)
├── prisma/                       # Database schema & seeder
│   ├── schema.prisma             # Definisi model database
│   └── seed.js                   # Seeder data awal
├── public/                       # File statis publik (gambar, uploads)
├── nuxt.config.js                # Konfigurasi Nuxt
├── package.json                  # Dependencies & scripts
├── .env                          # Environment variables (TIDAK di-commit)
└── .env.example                  # Template environment variables
```

---

## Fitur Aplikasi

| Modul                | Deskripsi                                                                 |
|----------------------|---------------------------------------------------------------------------|
| **Dashboard**        | Statistik pegawai, chart status kontrak & gender, tabel pegawai terbaru   |
| **Data Pegawai**     | CRUD pegawai lengkap dengan upload foto dan riwayat pendidikan            |
| **Manajemen User**   | CRUD user dengan validasi username, password, dan auto-fill data pegawai  |
| **Manajemen Role**   | Daftar role dan pengaturan hak akses (RBAC) per modul                     |
| **Tunjangan**        | Setting tarif, generate perhitungan, dan detail tunjangan transport       |
| **Log Aktifitas**    | Pencatatan otomatis setiap aksi CRUD yang dilakukan user                  |
| **Profil**           | Edit profil dan ganti password user yang sedang login                     |

---

## Akun Default (Seeder)

Setelah menjalankan seeder, akun berikut tersedia:

| Username        | Password       | Role          |
|-----------------|----------------|---------------|
| `superadmin`    | `Superadmin1!` | Superadmin    |
| `manager_hrd`   | `Manager1!`    | Manager HRD   |
| `admin_hrd`     | `Adminhrd1!`   | Admin HRD     |

> **Catatan:** Password di atas mungkin berbeda tergantung isi seeder. Silakan cek file `prisma/seed.js` untuk informasi akurat.

---

## Perintah yang Tersedia

| Perintah                       | Keterangan                                     |
|--------------------------------|------------------------------------------------|
| `npm run dev`                  | Jalankan dev server (hot-reload)               |
| `npm run build`                | Build aplikasi untuk production                |
| `npm run preview`              | Preview hasil build production                 |
| `npx prisma studio`           | Buka GUI Prisma untuk melihat/edit data        |
| `npx prisma db push`          | Sinkronisasi schema ke database                |
| `npx prisma db seed`          | Jalankan seeder data awal                      |
| `npx prisma generate`         | Generate ulang Prisma Client                   |
| `npx prisma migrate dev`      | Buat dan jalankan migration baru               |

---

## Catatan Penting

- File `.env` berisi informasi sensitif (password DB, secret key). **Jangan commit ke repository.** File ini sudah ada di `.gitignore`.
- Jika mengubah file `prisma/schema.prisma`, jalankan `npx prisma db push` dan `npx prisma generate` untuk menerapkan perubahan.
- Foto pegawai yang di-upload disimpan di folder `public/uploads/`.
- Aplikasi menggunakan JWT untuk autentikasi. Token disimpan di cookie browser dengan nama `token`.