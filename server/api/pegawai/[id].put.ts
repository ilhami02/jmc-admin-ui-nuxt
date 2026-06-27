import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (!id || isNaN(id)) {
        throw createError({ statusCode: 400, statusMessage: 'ID Pegawai tidak valid' })
    }

    const formData = await readMultipartFormData(event)
    if (!formData) throw createError({ statusCode: 400, statusMessage: 'Data tidak valid' })

    const body: Record<string, any> = {}
    for (const item of formData) {
        if (item.name) body[item.name] = item.data.toString()
    }

    const dataPendidikan = body.pendidikan ? JSON.parse(body.pendidikan) : [];

    try {
        const result = await prisma.$transaction(async (tx) => {
            await tx.pegawaiPendidikan.deleteMany({
                where: { 
                    id_pegawai: parseInt(id.toString())
                }
            });

            const updated = await tx.pegawai.update({
                where: { id: parseInt(id.toString()) },
                data: {
                    nip: body.nip,
                    nama_pegawai: body.nama_pegawai,
                    email: body.email,
                    nomor_hp: body.nomor_hp,
                    tempat_lahir: body.tempat_lahir,
                    id_kecamatan: body.id_kecamatan ? parseInt(body.id_kecamatan) : null,
                    alamat_lengkap: body.alamat_lengkap,
                    tanggal_lahir: body.tanggal_lahir ? new Date(body.tanggal_lahir) : undefined,
                    status_kawin: body.status_kawin,
                    jumlah_anak: body.jumlah_anak ? parseInt(body.jumlah_anak) : undefined,
                    tanggal_masuk: body.tanggal_masuk ? new Date(body.tanggal_masuk) : undefined,
                    id_jabatan: body.id_jabatan ? parseInt(body.id_jabatan) : undefined,
                    id_departemen: body.id_departemen ? parseInt(body.id_departemen) : undefined,
                    status: body.status,
                    pendidikan: {
                        create: dataPendidikan.map((p: any) => ({
                            tingkat_pendidikan: p.tingkat_pendidikan,
                            nama_sekolah: p.nama_sekolah,
                            tahun_lulus: parseInt(p.tahun_lulus)
                        }))
                    }
                }
            });
            return updated;
        });

        return {
            status: 'success',
            message: 'Data pegawai berhasil diubah',
            data: result
        }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message || 'Terjadi kesalahan' })
    }
})