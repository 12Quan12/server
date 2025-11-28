import { StatusCodes } from "http-status-codes"
import { env } from "~/config/environment"
import { jwtProvider } from "~/providers/jwtProvider"
import ApiError from "~/utils/ApiError"


const isAuthorized = async (req, res, next) => {
    const clientAccessToken = req.cookies?.accessToken
    // nếu như client accessToken = null trả về lỗi
    if (!clientAccessToken) next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized (Token not found)'))

    try {
        // verify token
        const accessTokenDecoded = await jwtProvider.verifyToken(
            clientAccessToken,
            env.ACCESS_TOKEN_SECRET_SIGNATURE
        )
        // lưu accessTokenDecoded vào req.jwtDecoded để những tầng tiếp theo sử dụng
        req.jwtDecoded = accessTokenDecoded
        next()
    } catch (error) {
        // nếu accessToken hết hạn trả về lỗi 401 để fe gọi refreshToken
        if (error?.message?.includes('jwt expired')) {
            next(new ApiError(StatusCodes.GONE, 'Need to refresh token!!!'))
            return
        }

        // nếu accessToken không hợp lệ trả về unauthorized
        next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!!!'))
    }
}

export const authMiddleware = {
    isAuthorized
}