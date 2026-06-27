import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const user = verifyToken(event)

    // get id pegawai from url
    const id = parseInt(event.context.params?.id as string)

    if (!id || isNaN(id)) {
        throw createError({ statusCode: 400, statusMessage: 'ID Pegawai tidak valid' })
    }

    try {
        // search pegawai
        const pegawai = await prisma.pegawai.findUnique({ where: { id } })
        if (!pegawai) {
            throw createError({ statusCode: 404, statusMessage: 'Data pegawai tidak ditemukan' })
        }

        // remove pegawai data
        await prisma.pegawai.delete({
            where: { id }
        })

        // log activities
        await prisma.activities.create({
            data: {
                title: 'Hapus Pegawai',
                content: `Menghapus data pegawai: ${pegawai.nama_pegawai}`,
                created_by: user.id
            }
        })

        return {
            status: 'success',
            message: `Data pegawai ${pegawai.nama_pegawai} berhasil dihapus`
        }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message || 'Terjadi kesalahan' })
    }
})