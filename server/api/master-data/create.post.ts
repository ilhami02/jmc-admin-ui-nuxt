import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.nama || !body.tipe) {
        throw createError({ statusCode: 400, statusMessage: 'Nama dan Tipe wajib diisi' })
    }

    try {
        const newData = await prisma.masterData.create({
            data: {
                nama: body.nama,
                tipe: body.tipe
            }
        })
        return { status: 'success', message: 'Data berhasil ditambahkan', data: newData }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message || 'Terjadi kesalahan' })
    }
})