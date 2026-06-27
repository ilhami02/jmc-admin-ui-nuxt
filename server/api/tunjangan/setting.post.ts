import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body.tarif_per_km || !body.berlaku_mulai || !body.min_kilometer || !body.max_kilometer) {
        throw createError({ statusCode: 400, statusMessage: 'Semua field wajib diisi' })
    }

    try {
        const newSetting = await prisma.settingTunjangan.create({
            data: {
                tarif_per_km: parseFloat(body.tarif_per_km),
                berlaku_mulai: new Date(body.berlaku_mulai),
                min_kilometer: parseInt(body.min_kilometer),
                max_kilometer: parseInt(body.max_kilometer)
            }
        })
        return { status: 'success', message: 'Pengaturan tunjangan berhasil disimpan', data: newSetting }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message || 'Terjadi kesalahan' })
    }
})