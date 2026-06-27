import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // const user = verifyToken(event)

    const nip = event.context.params?.id

    if (!nip) {
        throw createError({ statusCode: 400, statusMessage: 'NIP tidak valid' })
    }

    // Cari data pegawai berdasarkan NIP, sertakan relasinya
    const pegawai = await prisma.pegawai.findUnique({
        where: { nip: nip },
        include: {
            jabatan: true,
            departemen: true,
            kecamatan: true, // Untuk wilayah
            pendidikan: true // Untuk riwayat pendidikan
        }
    })

    if (!pegawai) {
        throw createError({ statusCode: 404, statusMessage: 'Data pegawai tidak ditemukan' })
    }

    return {
        status: 'success',
        data: pegawai
    }
})