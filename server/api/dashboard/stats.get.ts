import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const user = verifyToken(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    try {
        const magangJabatan = await prisma.masterData.findFirst({
            where: {
                tipe: 'jabatan',
                nama: {
                    contains: 'Magang'
                }
            }
        })
        const idMagang = magangJabatan ? magangJabatan.id : -1;

        // Ambil semua data pegawai (aktif)
        const semuaPegawai = await prisma.pegawai.findMany({
            where: {
                status: 'Aktif'
            },
            include: {
                jabatan: true,
                departemen: true
            }
        });

        // Hitung statistik
        const totalPegawai = semuaPegawai.length;
        
        let totalMagang = 0;
        let totalKontrak = 0;
        let totalTetap = 0;
        let totalPria = 0;
        let totalWanita = 0;

        semuaPegawai.forEach(p => {
            if (p.id_jabatan === idMagang) {
                totalMagang++;
            } else if (p.status_kontrak === 'PKWT') {
                totalKontrak++;
            } else if (p.status_kontrak === 'PKWTT') {
                totalTetap++;
            }
            
            if (p.jenis_kelamin === 'Pria') {
                totalPria++;
            } else if (p.jenis_kelamin === 'Wanita') {
                totalWanita++;
            }
        });

        // Ambil 5 pegawai terbaru berdasarkan tanggal_masuk
        const pegawaiTerbaru = await prisma.pegawai.findMany({
            where: {
                status: 'Aktif'
            },
            orderBy: {
                tanggal_masuk: 'desc'
            },
            take: 5,
            include: {
                jabatan: true,
                departemen: true
            }
        });

        const dataTerbaru = pegawaiTerbaru.map(p => {
            let photoPath = p.foto_pegawai || '../default-avatar.png';
            if (photoPath.startsWith('/uploads/')) {
                photoPath = '../../' + photoPath.substring(1);
            }
            return {
                nipp: p.nip,
                nama: p.nama_pegawai,
                photo: photoPath,
                tanggalMasuk: p.tanggal_masuk ? new Date(p.tanggal_masuk).toISOString().split('T')[0] : '-',
                status: p.status_kontrak,
                jabatan: p.jabatan?.nama || '-'
            };
        });

        return {
            status: 'success',
            data: {
                totalPegawai,
                totalKontrak,
                totalTetap,
                totalMagang,
                totalPria,
                totalWanita,
                pegawaiTerbaru: dataTerbaru
            }
        }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})
