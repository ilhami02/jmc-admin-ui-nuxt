import { PrismaClient } from '@prisma/client'
// import { verifyToken } from '~/server/utils/auth'
import { defineEventHandler} from 'h3'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    // verify is user login?
    // const user = verifyToken(event)
    
    // get data pegawai
    const pegawai = await prisma.pegawai.findMany({
        include: {
            jabatan: true,
            departemen: true
        },
        orderBy: {
            tanggal_masuk: 'desc'
        }
    })

    return {
        status: 'success',
        data: pegawai
    }
})