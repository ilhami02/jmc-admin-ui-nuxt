import { PrismaClient } from '@prisma/client'
// import { verifyToken } from '~/server/utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const currentUser = verifyToken(event)
        const body = await readBody(event)

        const { nama, username, email } = body

        if (!nama || !username) {
            throw createError({ statusCode: 400, statusMessage: 'Nama dan Username wajib diisi' })
        }

        // Cek apakah username sudah dipakai orang lain
        const existingUsername = await prisma.user.findFirst({
            where: {
                username: username,
                id: { not: currentUser.id }
            }
        })
        if (existingUsername) {
            throw createError({ statusCode: 400, statusMessage: 'Username sudah digunakan oleh akun lain' })
        }

        // Update data user
        const updatedUser = await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                nama,
                username,
                email
            }
        })

        // CATATAN: Karena username atau nama berubah, ideally kita butuh token baru 
        // tapi untuk mempermudah (krn ini hanya put endpoint), kita serahkan ke klien untuk re-login jika username berubah.

        return {
            status: 'success',
            message: 'Profil berhasil diperbarui',
            data: updatedUser
        }
    } catch (e: any) {
        throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || e.message })
    }
})
