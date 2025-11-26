import { StatusCodes } from "http-status-codes"
import { env } from "~/config/environment"
import { authService } from "~/services/authService"
const signIn = async (req, res, next) => {
    try {
        const signIned = await authService.signIn(req.body)
        res.cookie('refreshToken', signIned.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: env.REFRESH_TOKEN_TTL
        })
        return res.status(StatusCodes.OK).json({
            message: `User ${signIned.displayName} logged in!`,
            accessToken: signIned.accessToken
        })
    } catch (error) {
        next(error)
    }
}


const signUp = async (req, res, next) => {
    try {
        const createdAccount = await authService.signUp(req.body)
        return res.status(StatusCodes.CREATED).json(createdAccount)
    } catch (error) {
        next(error)
    }
}


const signOut = async (req, res, next) => {
    try {
        await authService.signOut(req.cookies)
        return res.status(StatusCodes.NO_CONTENT).json({ message: "logout success fully!!!" })
    } catch (error) {
        next(error)
    }
}

export const authController = {
    signIn,
    signUp,
    signOut
}