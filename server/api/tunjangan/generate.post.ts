import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { bulan, tahun, data_hari_kerja } = body
    
    // data_hari_kerja formatnya object: { "id_pegawai_1": 20, "id_pegawai_2": 22 }

    if (!bulan || !tahun || !data_hari_kerja) {
        throw createError({ statusCode: 400, statusMessage: 'Bulan, tahun, dan data hari kerja wajib diisi' })
    }

    try {
        const cekTunjangan = await prisma.tunjanganBulan.findFirst({
            where: { bulan: parseInt(bulan), tahun: parseInt(tahun) }
        })

        if (cekTunjangan) {
            throw createError({ statusCode: 400, statusMessage: `Data tunjangan untuk bulan ${bulan}/${tahun} sudah pernah di-generate.` })
        }

        const setting = await prisma.settingTunjangan.findFirst({
            orderBy: { berlaku_mulai: 'desc' }
        })

        if (!setting) {
            throw createError({ statusCode: 400, statusMessage: 'Setting tarif tunjangan belum diatur. Silakan atur terlebih dahulu.' })
        }

        const pegawaiAktif = await prisma.pegawai.findMany({
            where: { status: 'Aktif' }
        })

        if (pegawaiAktif.length === 0) {
            throw createError({ statusCode: 400, statusMessage: 'Tidak ada pegawai aktif untuk dihitung.' })
        }

        let total_penerima = 0
        let total_tunjangan_bulan = 0
        const detailTunjanganData: any[] = []

        for (const p of pegawaiAktif) {
            // Ambil input hari kerja dari frontend, default 0 jika tidak ada
            const hari_kerja = parseInt(data_hari_kerja[p.id.toString()]) || 0

            // Lewati jika hari kerjanya 0 (misal: cuti sebulan penuh)
            if (hari_kerja === 0) continue

            // Jarak default jika belum diset di database adalah 0
            const jarak_aktual = p.jarak_rumah_kantor || 0

            // LOGIKA BATAS KILOMETER
            let jarak_dihitung = jarak_aktual
            if (jarak_dihitung < setting.min_kilometer) {
                jarak_dihitung = setting.min_kilometer
            } else if (jarak_dihitung > setting.max_kilometer) {
                jarak_dihitung = setting.max_kilometer
            }

            // HITUNG NOMINAL PER PEGAWAI
            // Rumus: (Jarak * Tarif per Km) * Hari Kerja
            // Karena tarif_per_km di Prisma Decimal, jadikan number (float)
            const tarif = parseFloat(setting.tarif_per_km.toString())
            const nominal = (jarak_dihitung * tarif) * hari_kerja

            total_tunjangan_bulan += nominal
            total_penerima++

            detailTunjanganData.push({
                id_pegawai: p.id,
                kilometer: jarak_dihitung,
                jumlah_hari: hari_kerja,
                nominal: nominal
            })
        }

        const hasilGenerate = await prisma.$transaction(async (tx) => {
            // rekap bulanan
            const tunjanganBaru = await tx.tunjanganBulan.create({
                data: {
                    bulan: parseInt(bulan),
                    tahun: parseInt(tahun),
                    total_penerima: total_penerima,
                    total_tunjangan: total_tunjangan_bulan
                }
            })

            const detailWithTunjanganId = detailTunjanganData.map(d => ({
                ...d,
                id_tunjangan: tunjanganBaru.id
            }))

            await tx.detailTunjangan.createMany({
                data: detailWithTunjanganId
            })

            return tunjanganBaru
        })

        return {
            status: 'success',
            message: `Berhasil men-generate tunjangan untuk ${total_penerima} pegawai`,
            data: hasilGenerate
        }
    } catch (error: any) {
        console.error(error)
        throw createError({ statusCode: error.statusCode || 500, statusMessage: error.statusMessage || 'Terjadi kesalahan saat kalkulasi' })
    }
})