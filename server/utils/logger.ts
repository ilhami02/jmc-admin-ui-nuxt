import { PrismaClient } from '@prisma/client'
import { H3Event } from 'h3'

const prisma = new PrismaClient()

/**
 * Mencatat aktivitas pengguna ke dalam database (Tabel activities)
 * 
 * @param event - H3Event dari Nuxt untuk membaca IP, User-Agent, dan URL
 * @param title - Aksi yang dilakukan (misal: "LOGIN", "CREATE", "UPDATE", "DELETE", "READ")
 * @param content - Deskripsi atau modul yang diakses (misal: "Modul User - Menambah akun budi")
 * @param userId - ID User yang melakukan aksi (didapat dari verifyToken, jika login biarkan null karena di-set setelah verifikasi)
 */
export const logActivity = async (event: H3Event, title: string, content: string, userId: number) => {
    try {
        const req = event.node.req
        const ua = req.headers['user-agent'] || ''
        
        // Coba baca IP dari header proxy (X-Forwarded-For) atau langsung dari socket
        const forwarded = req.headers['x-forwarded-for'] as string
        const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress || ''
        
        const url = req.url || ''
        
        // Deteksi sederhana browser & platform dari User-Agent
        let browser = 'Unknown'
        let platform = 'Unknown'
        
        if (ua.includes('Windows')) platform = 'Windows'
        else if (ua.includes('Mac')) platform = 'MacOS'
        else if (ua.includes('Linux')) platform = 'Linux'
        else if (ua.includes('Android')) platform = 'Android'
        else if (ua.includes('iPhone') || ua.includes('iPad')) platform = 'iOS'

        if (ua.includes('Chrome')) browser = 'Chrome'
        else if (ua.includes('Firefox')) browser = 'Firefox'
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
        else if (ua.includes('Edge')) browser = 'Edge'

        await prisma.activities.create({
            data: {
                title,
                content,
                ua,
                ip,
                url,
                browser,
                platform,
                created_by: userId
            }
        })
    } catch (error) {
        console.error('Failed to log activity:', error)
        // Kita tidak mau memblokir eksekusi utama jika logger gagal, 
        // jadi error hanya di-print ke console.
    }
}
