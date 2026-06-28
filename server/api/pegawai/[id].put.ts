import { PrismaClient } from '@prisma/client'
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (!id || isNaN(id)) {
        throw createError({ statusCode: 400, statusMessage: 'ID Pegawai tidak valid' })
    }

    const formData = await readMultipartFormData(event)
    if (!formData) throw createError({ statusCode: 400, statusMessage: 'Data tidak valid' })

    const body: Record<string, any> = {}
    let fileFoto: any = null

    for (const item of formData) {
        if (item.name === 'foto_pegawai' && item.filename) {
            fileFoto = item
        } else if (item.name) {
            body[item.name] = item.data.toString('utf-8')
        }
    }

    let fotoUrl: string | undefined = undefined;
    if (fileFoto) {
        // hanya boleh format PNG/JPEG/JPG 
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png']
        
        if (!allowedMimeTypes.includes(fileFoto.type)) {
            throw createError({ 
                statusCode: 415, 
                statusMessage: 'Format file tidak diizinkan. Hanya menerima PNG, JPEG, atau JPG.' 
            })
        }

        // max file size 2 mb
        const maxSize = 2 * 1024 * 1024;
        if (fileFoto.data.length > maxSize) {
            throw createError({ statusCode: 413, statusMessage: 'Ukuran foto maksimal 2MB' })
        }

        // Save file in public/uploads
        const ext = fileFoto.type === 'image/png' ? '.png' : '.jpg'
        const fileName = `${uuidv4()}${ext}`
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true })
        }

        const filePath = join(uploadDir, fileName)
        writeFileSync(filePath, fileFoto.data)
        
        fotoUrl = `/uploads/${fileName}`
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
                    foto_pegawai: fotoUrl !== undefined ? fotoUrl : undefined,
                    nip: body.nip,
                    nama_pegawai: body.nama_pegawai,
                    email: body.email,
                    nomor_hp: body.nomor_hp,
                    tempat_lahir: body.tempat_lahir,
                    id_kecamatan: body.id_kecamatan ? parseInt(body.id_kecamatan) : null,
                    alamat_lengkap: body.alamat_lengkap,
                    tanggal_lahir: body.tanggal_lahir ? new Date(body.tanggal_lahir) : undefined,
                    status_kawin: body.status_kawin,
                    jenis_kelamin: body.jenis_kelamin,
                    status_kontrak: body.status_kontrak,
                    jumlah_anak: body.jumlah_anak ? parseInt(body.jumlah_anak) : undefined,
                    tanggal_masuk: body.tanggal_masuk ? new Date(body.tanggal_masuk) : undefined,
                    id_jabatan: body.id_jabatan ? parseInt(body.id_jabatan) : undefined,
                    id_departemen: body.id_departemen ? parseInt(body.id_departemen) : undefined,
                    usia: body.usia ? parseInt(body.usia) : undefined,
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