import { StatusCodes } from "http-status-codes"
import { userModel } from "~/models/userModel"
import ApiError from "~/utils/ApiError"
import bcrypt, { compare, compareSync } from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import { pickUser } from "~/utils/formaters"
import { zaloProvider } from "~/providers/zaloProvider"
import { DEFAULT_PAGE, WEBSITE_DOMAIN } from "~/utils/constants"
import { jwtProvider } from "~/providers/jwtProvider"
import { env } from "~/config/environment"
import { cloudinaryProvider } from "~/providers/cloudinaryProvider"

const createNew = async (reqBody) => {
    try {
        // kiểm tra xem email đã tồn tại trong hệ thông chưa
        const exitsUser = await userModel.findOneByEmail(reqBody.email)
        if (exitsUser) throw new ApiError(StatusCodes.CONFLICT, "Email already exits!!!")
        // tạo data để lưu vào database
        const nameFromEmail = reqBody.email.split("@")[0]
        const newUser = {
            email: reqBody.email,
            password: bcrypt.hashSync(reqBody.password, 8),
            username: nameFromEmail,
            displayName: nameFromEmail,
            verifyToken: uuidv4()
        }
        // thực hiện lưu thông tin user vào databse
        const createdUser = await userModel.createNew(newUser)
        const getNewUser = await userModel.findOneById(createdUser.insertedId)
        // gửi email cho người dùng xác thực tài khoản
        // id group test tool : 5710353298412057234
        const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
        const zalo = await new zaloProvider()
        await zalo.getSecretKey()
        await zalo.send_messager_to_group(verificationLink, '5710353298412057234')

        // return trả về dữ liệu cho phía controller
        return pickUser(getNewUser)
    } catch (error) { throw error }
}

const update = async (userId, reqBody, userAvatarFile) => {
    try {
        const exitsUser = await userModel.findOneById(userId)
        if (!exitsUser) throw new ApiError(StatusCodes.NOT_FOUND, "Account dose not exits!!!")
        if (!exitsUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Your account is not active!!!")
        let updatedUser = {}
        // trường hợp change password
        if (reqBody.currentPassword && reqBody.newPassword) {
            if (!bcrypt.compareSync(reqBody.currentPassword, exitsUser.password)) {
                throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Password iscorrect!!!")
            }
            updatedUser = await userModel.update(exitsUser._id, {
                password: bcrypt.hashSync(reqBody.newPassword, 8)
            })

        } else if (userAvatarFile) {
            // trường hợp uploadfile lên cloud storage, (cloudinary)
            const uploadResult = await cloudinaryProvider.streamUpload(userAvatarFile.buffer, "users")
            console.log("🚀 ~ update ~ uploadResult:", uploadResult)
            // lưu lại url của file vừa upload vào database
            updatedUser = await userModel.update(exitsUser._id, {
                avatar: uploadResult.secure_url
            })
        } else {
            updatedUser = await userModel.update(exitsUser._id, {
                displayName: reqBody.displayName
            })
        }
        return pickUser(updatedUser)
    } catch (error) { throw error }
}


const verifyAccount = async (reqBody) => {
    try {
        // kiểm tra xem email đã tồn tại trong hệ thông chưa
        const exitsUser = await userModel.findOneByEmail(reqBody.email)
        if (!exitsUser) throw new ApiError(StatusCodes.NOT_FOUND, "Email dose not exits!!!")
        if (exitsUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Your account is already active!!!")
        if (exitsUser.verifyToken !== reqBody.token) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Token is invalid!!!")
        // nếu mọi thứ ok update lại thông tin của user để verify tài khoản
        const updateData = {
            isActive: true,
            verifyToken: null
        }
        const updatedUser = await userModel.update(exitsUser._id, updateData)
        return pickUser(updatedUser)
    } catch (error) { throw error }
}

const login = async (reqBody) => {
    try {
        // kiểm tra xem email đã tồn tại trong hệ thông chưa
        const exitsUser = await userModel.findOneByEmail(reqBody.email)
        if (!exitsUser) throw new ApiError(StatusCodes.NOT_FOUND, "Email dose not exits!!!")
        if (!exitsUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Your account is not active!!!")
        if (!bcrypt.compareSync(reqBody.password, exitsUser.password)) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Your Email or Password iscorrect!!!")
        }
        const userInfo = {
            _id: exitsUser._id,
            email: exitsUser.email
        }
        // tạo ra accessToken và refreshToken để trả về cho client
        const accessToken = await jwtProvider.generateToken(
            userInfo,
            env.ACCESS_TOKEN_SECRET_SIGNATURE,
            env.ACCESS_TOKEN_TTL
        )
        const refreshToken = await jwtProvider.generateToken(
            userInfo,
            env.REFRESH_TOKEN_SECRET_SIGNATURE,
            env.REFRESH_TOKEN_TTL
        )
        return {
            accessToken,
            refreshToken,
            ...pickUser(exitsUser)
        }
    } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
    try {
        const refreshTokenDecoded = await jwtProvider.verifyToken(
            clientRefreshToken,
            env.REFRESH_TOKEN_SECRET_SIGNATURE
        )
        const userInfo = {
            _id: refreshTokenDecoded._id,
            email: refreshTokenDecoded.email
        }
        const accessToken = await jwtProvider.generateToken(
            userInfo,
            env.ACCESS_TOKEN_SECRET_SIGNATURE,
            env.ACCESS_TOKEN_TTL
        )
        return {
            accessToken
        }
    } catch (error) { throw error }
}

export const userService = {
    createNew,
    verifyAccount,
    login,
    refreshToken,
    update
}