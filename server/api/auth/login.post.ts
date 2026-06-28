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

    // Normalisasi nomor HP: jika berawalan '08', ubah menjadi format '+628'
    let phoneQuery = username
    if (username.startsWith('08')) {
        phoneQuery = '+628' + username.slice(2)
    }

    // search user role (mendukung login via username, email, atau nomor_hp pegawai)
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { username: username },
                { email: username },
                { pegawai: { nomor_hp: username } },
                { pegawai: { nomor_hp: phoneQuery } }
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
    const roleName = user.role?.nama_role
    const payload = { id: user.id, username: user.username, nama: user.nama, id_role: user.id_role, role_name: roleName }
    const token = jwt.sign(payload, secretKey, { expiresIn: '7d' })

    // Rekam log aktivitas login
    await logActivity(event, 'LOGIN', 'Autentikasi - User berhasil login', user.id)

    // Set token di cookie
    setCookie(event, 'token', token, {
        httpOnly: false, // Diubah menjadi false agar Nuxt client middleware bisa membacanya
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 604800 // 7 hari
    })

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