import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const currentUser = verifyToken(event)

        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: {
                id: true,
                nama: true,
                username: true,
                email: true,
                role: {
                    select: {
                        nama_role: true
                    }
                },
                pegawai: {
                    select: {
                        nomor_hp: true,
                        nip: true
                    }
                }
            }
        })

        if (!user) {
            throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' })
        }

        return {
            status: 'success',
            data: user
        }
    } catch (e: any) {
        throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || e.message })
    }
})
