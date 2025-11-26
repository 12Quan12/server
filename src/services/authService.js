import { StatusCodes } from "http-status-codes";
import { userModel } from "~/models/user";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import ApiError from "~/utils/ApiError";
import { env } from "~/config/environment";
import crypto from "crypto"
import { sessionModel } from "~/models/session";

const signUp = async (reqBody) => {
    try {
        const dupplicate = await userModel.findOneByUsername(reqBody.username);
        if (dupplicate) throw new ApiError(StatusCodes.CONFLICT, "User đã tồn tại");
        // hash password
        const hashsedPasswrod = await bcrypt.hash(reqBody.password, 10)
        const newUser = {
            username: reqBody.username,
            hashsedPasswrod,
            email: reqBody.email,
            displayName: `${reqBody.firstName} ${reqBody.lastName}`
        }
        await userModel.createNew(newUser)
        return { signUpSuccess: "Account created successfully!!!" }
    } catch (error) {
        throw error
    }
}

const signIn = async (reqBody) => {
    try {
        // lấy user
        const user = await userModel.findOneByUsername(reqBody.username)
        if (!user) throw new ApiError(StatusCodes.FORBIDDEN, "Username or password isCorrect")
        // lấy hashPassword để so sánh
        const passwordCorrect = await bcrypt.compare(reqBody.password, user.hashsedPasswrod)
        if (!passwordCorrect) throw new ApiError(StatusCodes.FORBIDDEN, "Username or password isCorrect")
        // nếu khớp tạo accessToken với JWT
        const accessToken = jwt.sign({ userId: user._id }, env.ACCESS_TOKEN_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL })
        // tạo refreshToken
        const refreshToken = crypto.randomBytes(64).toString('hex')
        // tạo session mới để lưu refresh token
        await sessionModel.createNew({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL)
        })
        return {
            accessToken,
            refreshToken,
            displayName: user.displayName
        }
    } catch (error) {
        throw error
    }
}

const signOut = async (reqCookies) => {
    try {
        // lấy refreshToken từ cookie
        const token = reqCookies.refreshToken
        if (token) {
            await sessionModel.deteleToken({ refreshToken: token })
        }
        return true
    } catch (error) {
        throw error
    }
}

export const authService = {
    signUp,
    signIn,
    signOut
}