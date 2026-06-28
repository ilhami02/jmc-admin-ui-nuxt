import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const page = parseInt(query.page as string) || 1
        const limit = parseInt(query.limit as string) || 10
        const skip = (page - 1) * limit

        const total = await prisma.user.count()
        const data = await prisma.user.findMany({
            skip,
            take: limit,
            include: {
                role: true, // Ambil nama role
                pegawai: {
                    include: {
                        jabatan: true,    
                        departemen: true 
                    }
                }
            },
            orderBy: { nama: 'asc' }
        })
        return { 
            status: 'success', 
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})