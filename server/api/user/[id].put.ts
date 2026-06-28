/**
 * PUT /api/user/:id
 * 
 * API ini digunakan untuk MENGUPDATE data user yang sudah ada.
 * Dipanggil saat user klik "Simpan" di modal edit.
 * 
 * Body (JSON):
 * - nama: string (nama pengguna)
 * - username: string
 * - id_role: number
 * - id_pegawai: number (relasi ke tabel pegawai)
 * - disabled: number (0 = aktif, 1 = nonaktif)
 * - password: string (opsional, hanya di-update jika diisi)
 * - id_jabatan: number (untuk update data pegawai terkait)
 * - id_departemen: number (untuk update data pegawai terkait)
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // Ambil ID dari URL parameter, misal: /api/user/5 → id = 5
    const id = parseInt(event.context.params?.id || '0')

    // Baca body JSON yang dikirim dari frontend
    const body = await readBody(event)

    try {
        // ===== Validasi Username Unik =====
        // Cek apakah username sudah dipakai user LAIN (bukan diri sendiri)
        if (body.username) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    username: body.username,
                    NOT: { id: id }  // Kecualikan user yang sedang diedit
                }
            })
            if (existingUser) {
                throw createError({
                    statusCode: 409,  // 409 = Conflict
                    statusMessage: 'Username sudah digunakan oleh user lain'
                })
            }
        }

        // ===== Siapkan data yang akan di-update =====
        // Kita buat object "updateData" yang berisi field-field yang mau diubah
        const updateData: any = {
            nama: body.nama,
            username: body.username,
            id_role: body.id_role ? parseInt(body.id_role) : undefined,
            id_pegawai: body.id_pegawai ? parseInt(body.id_pegawai) : undefined,
            disabled: body.disabled !== undefined ? body.disabled : undefined
        }

        // ===== Password hanya di-update jika diisi =====
        // Saat edit, field password boleh kosong (artinya tidak ingin ganti password)
        // Jika diisi, kita hash dulu sebelum disimpan ke database
        if (body.password && body.password.trim() !== '') {
            updateData.password_hash = await bcrypt.hash(body.password, 10)
        }

        // ===== Update data user di database =====
        const updatedUser = await prisma.user.update({
            where: { id },      // Cari user berdasarkan ID
            data: updateData     // Data yang akan diupdate
        })

        // ===== Update jabatan & departemen di tabel pegawai =====
        // Karena jabatan dan departemen disimpan di tabel pegawai (bukan user),
        // kita perlu update tabel pegawai juga jika id_pegawai tersedia
        if (body.id_pegawai && (body.id_jabatan || body.id_departemen)) {
            const pegawaiUpdate: any = {}
            if (body.id_jabatan) pegawaiUpdate.id_jabatan = parseInt(body.id_jabatan)
            if (body.id_departemen) pegawaiUpdate.id_departemen = parseInt(body.id_departemen)

            await prisma.pegawai.update({
                where: { id: parseInt(body.id_pegawai) },
                data: pegawaiUpdate
            })
        }

        return { status: 'success', message: 'User berhasil diperbarui', data: updatedUser }
    } catch (e: any) {
        // Jika error sudah berupa createError (misal 409), lempar ulang
        if (e.statusCode) throw e
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})
