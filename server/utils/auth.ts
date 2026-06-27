import jwt from 'jsonwebtoken'
import { H3Event, getHeader, createError } from 'h3'

export const verifyToken = (event: H3Event) => {
    const authHeader = getHeader(event, 'Authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Token tidak tersedia'
        })
    }

    try {
        const secretKey = process.env.JWT_SECRET || 'fallback_secret'
        const decoded = jwt.verify(token, secretKey)
        return decoded // data user (id, role, dll)
    } catch (err) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Token tidak valid atau kadaluwarsa'
        })
    }
}