import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const data = await prisma.userRole.findMany({
            orderBy: { id: 'asc' }
        })
        return { status: 'success', data }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})