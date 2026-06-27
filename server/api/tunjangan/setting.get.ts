import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        // Ambil 1 data setting yang paling baru berdasarkan tanggal berlaku_mulai
        const setting = await prisma.settingTunjangan.findFirst({
            orderBy: { berlaku_mulai: 'desc' }
        })
        return { status: 'success', data: setting }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})