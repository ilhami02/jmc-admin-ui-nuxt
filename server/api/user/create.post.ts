import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
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
        return { status: 'success', data: newUser }
    } catch (e: any) {
        throw createError({ statusCode: 500, statusMessage: e.message })
    }
})