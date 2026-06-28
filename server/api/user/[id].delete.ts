/**
 * DELETE /api/user/:id
 * 
 * API untuk menghapus user.
 * 
 * VALIDASI PENTING:
 * - User yang sedang login TIDAK BOLEH menghapus dirinya sendiri.
 * - Ini dilakukan dengan membandingkan ID yang mau dihapus dengan
 *   ID user yang sedang login (dari JWT token di header Authorization).
 * 
 * Kenapa? Karena jika superadmin menghapus akunnya sendiri,
 * dia akan terlogout dan tidak bisa login lagi. Ini berbahaya
 * terutama jika tidak ada admin lain yang bisa memulihkan aksesnya.
 */
import { PrismaClient } from '@prisma/client'
// import { verifyToken } from '~/server/utils/auth'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = parseInt(event.context.params?.id || '0')

    // ===== Cek user yang sedang login =====
    // verifyToken() membaca JWT dari header Authorization,
    // lalu men-decode isinya → { id, username, id_role, role_name }
    // Jika token tidak ada atau tidak valid, akan throw error 401/403.
    //
    // Catatan: Jika autentikasi masih di-disable (token tidak dikirim),
    // kita tetap coba verifikasi. Jika gagal, kita skip pengecekan ini
    // dan biarkan delete berjalan normal (untuk kemudahan development).
    try {
        const currentUser = verifyToken(event)

        // Bandingkan: apakah user mau menghapus dirinya sendiri?
        if (currentUser && currentUser.id === id) {
            throw createError({
                statusCode: 403,  // 403 = Forbidden (dilarang)
                statusMessage: 'Anda tidak dapat menghapus akun Anda sendiri'
            })
        }
    } catch (e: any) {
        // Jika error-nya adalah 403 (larangan hapus diri sendiri), lempar ulang
        if (e.statusCode === 403) throw e
        // Jika error-nya karena token tidak ada (401) → skip pengecekan
        // Ini agar tidak error saat development (belum ada token)
    }

    try {
        await prisma.user.delete({ where: { id } })
        return { status: 'success', message: 'User berhasil dihapus' }
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})