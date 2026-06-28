import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const data = await prisma.user.findMany({
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
        return { status: 'success', data }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})