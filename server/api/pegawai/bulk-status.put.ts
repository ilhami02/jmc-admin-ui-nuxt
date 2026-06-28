import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    let currentUser: any = null
    try {
        currentUser = verifyToken(event)
    } catch (e) {}

    const body = await readBody(event)
    const { ids, status } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Tidak ada data pegawai yang dipilih' })
    }

    if (status !== 'Aktif' && status !== 'Nonaktif') {
        throw createError({ statusCode: 400, statusMessage: 'Status tidak valid' })
    }

    try {
        const updated = await prisma.pegawai.updateMany({
            where: { id: { in: ids } },
            data: { status }
        })

        if (currentUser) {
            await logActivity(event, 'UPDATE', `Modul Pegawai - Mengubah status ${updated.count} pegawai secara massal menjadi ${status}`, currentUser.id)
        }

        return { status: 'success', message: `Status ${updated.count} data pegawai berhasil diubah` }
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})
