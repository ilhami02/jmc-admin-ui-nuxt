import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const currentUser = verifyToken(event)
        const body = await readBody(event)

        const { oldPassword, newPassword } = body

        if (!oldPassword || !newPassword) {
            throw createError({ statusCode: 400, statusMessage: 'Password lama dan baru wajib diisi' })
        }

        // Ambil data user beserta password hash-nya
        const user = await prisma.user.findUnique({
            where: { id: currentUser.id }
        })

        if (!user) {
            throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' })
        }

        // Validasi aturan password baru
        if (newPassword.length < 8) {
            throw createError({ statusCode: 400, statusMessage: 'Password baru minimal 8 karakter' })
        }
        if (/\s/.test(newPassword)) {
            throw createError({ statusCode: 400, statusMessage: 'Password baru tidak boleh mengandung spasi' })
        }
        if (!/[A-Z]/.test(newPassword)) {
            throw createError({ statusCode: 400, statusMessage: 'Password baru harus mengandung minimal 1 huruf besar' })
        }
        if (!/[a-z]/.test(newPassword)) {
            throw createError({ statusCode: 400, statusMessage: 'Password baru harus mengandung minimal 1 huruf kecil' })
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
            throw createError({ statusCode: 400, statusMessage: 'Password baru harus mengandung minimal 1 karakter khusus' })
        }

        // Verifikasi password lama
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash!)
        if (!isPasswordValid) {
            throw createError({ statusCode: 400, statusMessage: 'Password lama tidak sesuai' })
        }

        // Hash password baru
        const salt = await bcrypt.genSalt(10)
        const newPasswordHash = await bcrypt.hash(newPassword, salt)

        // Update password di database
        await prisma.user.update({
            where: { id: currentUser.id },
            data: { password_hash: newPasswordHash }
        })

        await logActivity(event, 'UPDATE', 'Modul Change Password - Mengubah kata sandi', currentUser.id)

        return {
            status: 'success',
            message: 'Password berhasil diubah'
        }
    } catch (e: any) {
        throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || e.message })
    }
})
