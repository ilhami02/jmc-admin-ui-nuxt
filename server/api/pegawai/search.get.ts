/**
 * GET /api/pegawai/search?q=keyword
 * 
 * API ini digunakan untuk fitur AUTOSUGGESTION pada form tambah user.
 * Ketika user mengetik nama di field "Nama Pengguna", frontend akan
 * mengirim request ke endpoint ini untuk mencari data pegawai yang cocok.
 * 
 * Query parameter:
 * - q: keyword pencarian (minimal 2 karakter)
 * 
 * Response: { status: 'success', data: [...pegawai] }
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // Ambil query parameter "q" dari URL
    // Contoh: /api/pegawai/search?q=ahmad → q = "ahmad"
    const query = getQuery(event)
    const q = (query.q as string || '').trim()

    // Jika keyword kurang dari 2 karakter, kembalikan array kosong
    // Ini sesuai ketentuan: "minimal dua digit untuk memunculkan autosuggest"
    if (q.length < 2) {
        return { status: 'success', data: [] }
    }

    try {
        // Cari pegawai yang nama_pegawai-nya mengandung keyword (case-insensitive)
        // "contains" artinya mencari substring, jadi "ahm" akan cocok dengan "Ahmad"
        const data = await prisma.pegawai.findMany({
            where: {
                nama_pegawai: {
                    contains: q
                }
            },
            // Include jabatan dan departemen supaya bisa ditampilkan di suggestion
            include: {
                jabatan: true,
                departemen: true
            },
            // Batasi hasil agar tidak terlalu banyak
            take: 10,
            orderBy: { nama_pegawai: 'asc' }
        })

        return { status: 'success', data }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})
