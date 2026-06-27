import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const keyword = query.q as string

    if (!keyword || keyword.length < 3) return []

    return await prisma.masterWilayah.findMany({
        where: {
            kecamatan: { contains: keyword }
        },
        take: 10 // Batasi hasil agar tidak berat
    })
})