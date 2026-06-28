/**
 * GET /api/user/check-username?username=xxx&excludeId=yyy
 * 
 * API ini digunakan untuk VALIDASI KEUNIKAN USERNAME secara realtime.
 * Saat user mengetik username di form, frontend akan mengirim request
 * ke endpoint ini untuk mengecek apakah username sudah dipakai user lain.
 * 
 * Query parameter:
 * - username: username yang ingin dicek
 * - excludeId: (opsional) ID user yang dikecualikan (digunakan saat edit,
 *              agar username milik user itu sendiri tidak dianggap duplikat)
 * 
 * Response: { available: true/false }
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const username = (query.username as string || '').trim()
    const excludeId = query.excludeId ? parseInt(query.excludeId as string) : null

    // Jika username kosong, anggap tidak tersedia
    if (!username) {
        return { available: false }
    }

    try {
        // Cari user yang punya username yang sama
        // Jika sedang mode edit, kita exclude user yang sedang diedit
        // supaya username miliknya sendiri tidak dianggap sudah terpakai
        const existingUser = await prisma.user.findFirst({
            where: {
                username: username,
                // "NOT" artinya: kecuali yang id-nya = excludeId
                ...(excludeId ? { NOT: { id: excludeId } } : {})
            }
        })

        // Jika existingUser = null, berarti username tersedia (available: true)
        // Jika existingUser ada, berarti sudah terpakai (available: false)
        return { available: !existingUser }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }
})
