/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from "joi"
import { StatusCodes } from "http-status-codes"
import ApiError from "~/utils/ApiError"
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators"

const createNew = async (req, res, next) => {
    // tạo điều kiện để valid body
    const correctCondition = Joi.object({
        boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        title: Joi.string().required().min(3).max(50).trim().strict()
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

const update = async (req, res, next) => {
    // tạo điều kiện để valid body
    const correctCondition = Joi.object({
        boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        title: Joi.string().min(3).max(50).trim().strict()
    })
    try {
        await correctCondition.validateAsync(req.body, {
            abortEarly: false, // trả về nhiều lỗi nếu có
            allowUnknown: true // cho phép các field ngoài field đã định nghĩa
        })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

const deleteItem = async (req, res, next) => {
    // tạo điều kiện để valid body
    const correctCondition = Joi.object({
        id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    })
    try {
        await correctCondition.validateAsync(req.params)
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}
export const columnValidation = {
    createNew,
    update,
    deleteItem
}