import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = parseInt(event.context.params?.id || '0')

    try {
        const data = await prisma.userRole.findUnique({
            where: { id: id },
            include: {
                permission: true
            }
        })
        
        if (!data) throw createError({ statusCode: 404, statusMessage: 'Role tidak ditemukan' })
        
        return { status: 'success', data }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})