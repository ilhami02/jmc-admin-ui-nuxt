import { PrismaClient } from '@prisma/client'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // const user = verifyToken(event)
    
    const formData = await readMultipartFormData(event)
    
    if (!formData) {
        throw createError({ statusCode: 400, statusMessage: 'Data tidak valid atau kosong' })
    }

    // untuk debug postman (konversi ke string)
    const body: Record<string, any> = {}
    for (const item of formData) {
        if (item.name) body[item.name] = item.data.toString()
    }

    let fileFoto: any = null

    for (const item of formData) {
        if (item.name === 'foto_pegawai' && item.filename) {
            fileFoto = item
        } else if (item.name) {
            body[item.name] = item.data.toString('utf-8')
        }
    }

    // validate if file have been uploaded
    let fotoUrl = null
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
        
        // Buat folder jika belum ada
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true })
        }

        const filePath = join(uploadDir, fileName)
        writeFileSync(filePath, fileFoto.data)
        
        fotoUrl = `/uploads/${fileName}`
    }

    // fields checking
    const requiredFields = [
        'nip', 'nama_pegawai', 'email', 'nomor_hp', 'tempat_lahir', 
        'tanggal_lahir', 'status_kawin', 'tanggal_masuk', 'id_jabatan', 'id_departemen',
        'jenis_kelamin', 'status_kontrak'
    ];
    for (const field of requiredFields) {
        if (!body[field]) {
            throw createError({ statusCode: 400, statusMessage: `Field ${field} wajib diisi` })
        }
    }

    // validate Regex 
    if (!/^\d{8,}$/.test(body.nip)) throw createError({ statusCode: 400, statusMessage: 'NIP harus berupa angka minimal 8 karakter' })
    if (!/^[a-zA-Z0-9\s']+$/.test(body.nama_pegawai)) throw createError({ statusCode: 400, statusMessage: 'Format nama pegawai tidak valid' })
    if (!/^\S+@\S+\.\S+$/.test(body.email)) throw createError({ statusCode: 400, statusMessage: 'Format email tidak valid' })
    if (!/^\+\d{10,15}$/.test(body.nomor_hp)) throw createError({ statusCode: 400, statusMessage: 'Nomor HP harus format internasional (+62...)' })

    try {
        const dataPendidikan = body.pendidikan ? JSON.parse(body.pendidikan) : [];
        
        const pegawaiBaru = await prisma.pegawai.create({
            data: {
                foto_pegawai: fotoUrl,
                nip: body.nip,
                nama_pegawai: body.nama_pegawai,
                email: body.email,
                nomor_hp: body.nomor_hp,
                tempat_lahir: body.tempat_lahir,
                id_kecamatan: body.id_kecamatan ? parseInt(body.id_kecamatan) : null,
                alamat_lengkap: body.alamat_lengkap || null,
                jarak_rumah_kantor: body.jarak_rumah_kantor ? parseInt(body.jarak_rumah_kantor) : null,
                tanggal_lahir: new Date(body.tanggal_lahir),
                status_kawin: body.status_kawin,
                jenis_kelamin: body.jenis_kelamin,
                status_kontrak: body.status_kontrak,
                jumlah_anak: body.jumlah_anak ? parseInt(body.jumlah_anak) : 0,
                tanggal_masuk: new Date(body.tanggal_masuk),
                id_jabatan: parseInt(body.id_jabatan),
                id_departemen: parseInt(body.id_departemen),
                usia: body.usia ? parseInt(body.usia) : null,
                status: body.status || 'Aktif',
                pendidikan: {
                    create: dataPendidikan.map((p: any) => ({
                        tingkat_pendidikan: p.tingkat_pendidikan,
                        nama_sekolah: p.nama_sekolah,
                        tahun_lulus: parseInt(p.tahun_lulus)
                    }))
                }
            }
        })

        await prisma.activities.create({
            data: {
                title: 'Tambah Pegawai',
                content: `Menambah data pegawai baru: ${pegawaiBaru.nama_pegawai}`,
                // created_by: user.id
            }
        })

        return { status: 'success', message: 'Data pegawai berhasil ditambahkan', data: pegawaiBaru }
    } catch (error: any) {
        if (error.code === 'P2002') throw createError({ statusCode: 409, statusMessage: 'NIP atau Email sudah terdaftar' })
        throw createError({ statusCode: 500, statusMessage: 'Terjadi kesalahan internal' })
    }
})