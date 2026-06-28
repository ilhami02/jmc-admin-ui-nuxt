import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = parseInt(event.context.params?.id || '0')

    if (!id || isNaN(id)) {
        throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })
    }

    try {
        await prisma.masterData.delete({
            where: { id: id }
        })
        return { status: 'success', message: 'Data berhasil dihapus' }
    } catch (error: any) {
        // Handle error jika data sedang dipakai di tabel pegawai (Foreign Key Constraint)
        if (error.code === 'P2003') {
            throw createError({ statusCode: 400, statusMessage: 'Data tidak bisa dihapus karena sedang digunakan oleh Pegawai' })
        }
        throw createError({ statusCode: 500, statusMessage: error.message || 'Gagal menghapus data' })
    }
})