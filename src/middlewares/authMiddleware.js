import { StatusCodes } from "http-status-codes"
import jwt from "jsonwebtoken"
import { env } from "~/config/environment"
import ApiError from "~/utils/ApiError"

export const protectedRoute = (req, res, next) => {
    try {
        // lấy accessToken từ headers
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(" ")[1]

        if (!token) throw new ApiError(StatusCodes.UNAUTHORIZED, "Token không hợp lệ")
        jwt.verify(token, env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
            try {
                if (err) throw new ApiError(StatusCodes.FORBIDDEN, "Acesstoken hết hạn hoặc không hợp lệ!!!")
                req.userId = await decodedUser.userId
                next()
            } catch (error) {
                next(error)
            }
        })
    } catch (error) {
        next(error)
    }
}