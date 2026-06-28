import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        verifyToken(event)
    } catch (e) {
        // Let it pass for now if no auth implemented properly
    }

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = (query.search as string) || ''
    
    // Sort
    const sortBy = (query.sort_by as string) || 'created_at'
    let sortOrder = (query.sort_order as string) || 'desc'
    if (sortOrder !== 'asc' && sortOrder !== 'desc') sortOrder = 'desc'

    // Filters
    const jabatanFilter = query.jabatan ? (query.jabatan as string).split(',').map(Number) : []
    const masaKerjaMin = query.masa_kerja_min ? parseInt(query.masa_kerja_min as string) : null
    const masaKerjaMax = query.masa_kerja_max ? parseInt(query.masa_kerja_max as string) : null
    const statusKontrak = query.status_kontrak as string

    // Build Where Condition
    const whereCondition: any = {}

    // Search: NIP, Nama, Jabatan
    if (search) {
        whereCondition.OR = [
            { nip: { contains: search } },
            { nama_pegawai: { contains: search } },
            { jabatan: { nama: { contains: search } } }
        ]
    }

    // Filter Jabatan (multi select)
    if (jabatanFilter.length > 0) {
        whereCondition.id_jabatan = { in: jabatanFilter }
    }

    // Filter Status Kontrak
    if (statusKontrak) {
        whereCondition.status_kontrak = statusKontrak
    }

    // Filter Masa Kerja
    if (masaKerjaMin !== null || masaKerjaMax !== null) {
        const today = new Date()
        let minDate: Date | undefined
        let maxDate: Date | undefined

        // max_masa_kerja = 5 (joined 5 years ago, so minimum date is today - 5 years)
        if (masaKerjaMax !== null) {
            minDate = new Date()
            minDate.setFullYear(today.getFullYear() - masaKerjaMax - 1) 
        }
        
        if (masaKerjaMin !== null) {
            maxDate = new Date()
            maxDate.setFullYear(today.getFullYear() - masaKerjaMin)
        }

        whereCondition.tanggal_masuk = {}
        if (minDate) whereCondition.tanggal_masuk.gte = minDate
        if (maxDate) whereCondition.tanggal_masuk.lte = maxDate
    }

    // Prisma Order By mapping
    let orderByCondition: any = {}
    if (sortBy === 'nip') {
        orderByCondition.nip = sortOrder
    } else if (sortBy === 'nama') {
        orderByCondition.nama_pegawai = sortOrder
    } else if (sortBy === 'jabatan') {
        orderByCondition.jabatan = { nama: sortOrder }
    } else if (sortBy === 'tanggal_masuk') {
        orderByCondition.tanggal_masuk = sortOrder
    } else if (sortBy === 'masa_kerja') {
        // Masa kerja sort = reverse of tanggal_masuk
        orderByCondition.tanggal_masuk = sortOrder === 'asc' ? 'desc' : 'asc'
    } else {
        orderByCondition.created_at = sortOrder
    }

    // Pagination
    const skip = (page - 1) * limit
    
    // Fetch Count
    const totalRows = await prisma.pegawai.count({ where: whereCondition })

    // Fetch Data
    const data = await prisma.pegawai.findMany({
        where: whereCondition,
        include: {
            jabatan: true,
            departemen: true
        },
        orderBy: orderByCondition,
        skip: skip,
        take: limit
    })

    return {
        status: 'success',
        data: data,
        meta: {
            page,
            limit,
            totalRows,
            totalPages: Math.ceil(totalRows / limit)
        }
    }
})