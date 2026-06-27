import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = parseInt(event.context.params?.id || '0')

    if (!id || isNaN(id)) {
        throw createError({ statusCode: 400, statusMessage: 'ID Tunjangan tidak valid' })
    }

    try {
        const data = await prisma.tunjanganBulan.findUnique({
            where: { id },
            include: {
                detail_tunjangan: {
                    include: {
                        pegawai: true
                    }
                }
            }
        })

        if (!data) throw createError({ statusCode: 404, statusMessage: 'Data tidak ditemukan' })

        return { status: 'success', data }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})