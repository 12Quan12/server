/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from "joi"
import { StatusCodes } from "http-status-codes"
import ApiError from "~/utils/ApiError"

const signUp = async (req, res, next) => {
    // tạo điều kiện để valid body
    const correctCondition = Joi.object({
        username: Joi.string().required().min(10).max(50).trim().strict(),
        password: Joi.string().required().trim().strict(),
        email: Joi.string().required().max(30).trim().strict(),
        firstName: Joi.string().required().trim().strict(),
        lastName: Joi.string().required().trim().strict()
    })
    try {
        await correctCondition.validateAsync(req.body, {
            abortEarly: false // trả về nhiều lỗi nếu có
        })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}


const signIn = async (req, res, next) => {
    // tạo điều kiện để valid body
    const correctCondition = Joi.object({
        username: Joi.string().required().min(10).max(50).trim().strict(),
        password: Joi.string().required().trim().strict(),
    })
    try {
        await correctCondition.validateAsync(req.body, {
            abortEarly: false // trả về nhiều lỗi nếu có
        })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

export const authValidation = {
    signUp,
    signIn
}