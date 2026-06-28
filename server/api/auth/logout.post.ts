//import { logActivity } from '~/server/utils/logger'
// import { verifyToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
    try {
        const currentUser = verifyToken(event)
        
        if (currentUser) {
            // Rekam log logout
            await logActivity(event, 'LOGOUT', 'Autentikasi - User berhasil logout', currentUser.id)
        }
        
        return {
            status: 'success',
            message: 'Logout berhasil dicatat'
        }
    } catch (e: any) {
        // Jika token tidak valid, biarkan saja
        return { status: 'success' }
    }
})
