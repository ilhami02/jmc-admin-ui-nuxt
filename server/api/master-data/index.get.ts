import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // Memungkinkan filtering by tipe (misal: ?tipe=Jabatan)
    const query = getQuery(event)
    const tipe = query.tipe as string

    try {
        const data = await prisma.masterData.findMany({
            where: tipe ? { tipe: tipe } : undefined,
            orderBy: [
                { tipe: 'asc' },
                { nama: 'asc' }
            ]
        })
        return { status: 'success', data }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})  