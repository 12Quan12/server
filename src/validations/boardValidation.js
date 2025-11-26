/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from "joi"
import { StatusCodes } from "http-status-codes"
import ApiError from "~/utils/ApiError"
import { BOARD_TYPES } from "~/utils/constants";


const createNew = async (req, res, next) => {
    // tạo điều kiện để valid body
    const correctCondition = Joi.object({
        title: Joi.string().required().min(3).max(50).trim().strict(), // kiểu dữ liệu của title là string
        description: Joi.string().required().min(3).max(256).trim().strict(), // kiểu dữ liệu của title là string
        type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
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
export const boardValidation = {
    createNew
}