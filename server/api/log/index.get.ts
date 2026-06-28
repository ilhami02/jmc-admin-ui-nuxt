import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        verifyToken(event) // Pastikan user login

        const query = getQuery(event)
        const page = parseInt(query.page as string) || 1
        const limit = parseInt(query.limit as string) || 10
        const search = (query.search as string) || ''
        const skip = (page - 1) * limit

        // Buat filter pencarian
        let whereCondition: any = {}
        if (search) {
            whereCondition = {
                OR: [
                    { title: { contains: search } },
                    { content: { contains: search } },
                    {
                        activities_created: {
                            nama: { contains: search }
                        }
                    }
                ]
            }
        }

        // Hitung total data
        const totalRows = await prisma.activities.count({
            where: whereCondition
        })

        // Ambil data dengan paginasi
        const data = await prisma.activities.findMany({
            where: whereCondition,
            skip: skip,
            take: limit,
            orderBy: {
                created_at: 'desc'
            },
            include: {
                activities_created: {
                    select: { nama: true }
                }
            }
        })

        // Format data agar sesuai dengan kebutuhan UI
        const formattedData = data.map(item => ({
            id: item.id.toString(), // BigInt harus diubah ke string agar aman dikirim via JSON
            user: item.activities_created?.nama || 'Sistem',
            modul: item.content || '-',
            aksi: item.title || '-',
            timestamp: item.created_at
        }))

        return {
            status: 'success',
            data: formattedData,
            meta: {
                page,
                limit,
                totalRows,
                totalPages: Math.ceil(totalRows / limit)
            }
        }
    } catch (e: any) {
        throw createError({ statusCode: e.statusCode || 500, statusMessage: e.statusMessage || e.message })
    }
})
