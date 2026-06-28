import { defineEventHandler, createError, readBody } from 'h3'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // payload dari request body
    const body = await readBody(event)
    const { username, password } = body

    // Validate input
    if (!username || !password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Username dan password wajib diisi!'
        })
    }

    // search user role (mendukung login via username, email, atau nomor_hp pegawai)
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { username: username },
                { email: username },
                { pegawai: { nomor_hp: username } }
            ]
        },
        include: { role: true, pegawai: true } 
    })

    // check active or disabled user
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Username tidak terdaftar!'
        })
    }
    if (user.disabled === 1) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Akun Anda dinonaktifkan!'
        })
    }

    // validate password hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash!)
    if (!isPasswordValid) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Password salah!'
        })
    }

    // create JWT token
    const secretKey = process.env.JWT_SECRET || 'fallback_secret'
    const token = jwt.sign(
        { 
            id: user.id, 
            username: user.username, 
            id_role: user.id_role,
            role_name: user.role?.nama_role
        },
        secretKey,
        { expiresIn: '7d' } // JWT diset 7 hari karena expired 3 menit di-handle secara idle-timeout di frontend
    )

    // save last login time
    await prisma.user.update({
        where: { id: user.id },
        data: { last_login: new Date() }
    })

    // send response
    return {
        status: 'success',
        message: 'Login berhasil',
        data: {
            token,
            user: {
                id: user.id,
                nama: user.nama,
                username: user.username,
                role: user.role?.nama_role
            }
        }
    }
})