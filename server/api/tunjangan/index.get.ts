import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        // Ambil semua riwayat tunjangan, urutkan dari yang terbaru
        const data = await prisma.tunjanganBulan.findMany({
            orderBy: [
                { tahun: 'desc' },
                { bulan: 'desc' }
            ]
        })
        return { status: 'success', data }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})