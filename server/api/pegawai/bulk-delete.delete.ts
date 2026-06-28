import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    let currentUser: any = null
    try {
        currentUser = verifyToken(event)
    } catch (e) {}

    const body = await readBody(event)
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Tidak ada data pegawai yang dipilih' })
    }

    try {
        const deleted = await prisma.pegawai.deleteMany({
            where: { id: { in: ids } }
        })

        if (currentUser) {
            await logActivity(event, 'DELETE', `Modul Pegawai - Menghapus ${deleted.count} data pegawai secara massal`, currentUser.id)
        }

        return { status: 'success', message: `${deleted.count} data pegawai berhasil dihapus` }
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})
