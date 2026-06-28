import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // Dapatkan user yang sedang login untuk log
    let currentUser: any = null
    try {
        currentUser = verifyToken(event)
    } catch (e) {
        // Biarkan jika belum ada autentikasi
    }

    const body = await readBody(event)

    // Validasi username unik sebelum membuat user baru
    if (body.username) {
        const existingUser = await prisma.user.findFirst({
            where: { username: body.username }
        })
        if (existingUser) {
            throw createError({ statusCode: 409, statusMessage: 'Username sudah digunakan' })
        }
    }

    const hashedPassword = await bcrypt.hash(body.password, 10)
    
    try {
        const newUser = await prisma.user.create({
            data: {
                nama: body.nama,
                username: body.username,
                password_hash: hashedPassword,
                id_role: parseInt(body.id_role),
                id_pegawai: body.id_pegawai ? parseInt(body.id_pegawai) : null,
                disabled: body.disabled
            }
        })

        if (currentUser) {
            await logActivity(event, 'CREATE', `Modul Kelola User - Membuat akun dengan username: ${newUser.username}`, currentUser.id)
        }

        return { status: 'success', data: newUser }
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})