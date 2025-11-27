/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from "joi"
import { StatusCodes } from "http-status-codes"
import ApiError from "~/utils/ApiError"
import { BOARD_TYPES } from "~/utils/constants";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";


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

const update = async (req, res, next) => {
    // tạo điều kiện để valid body
    const correctCondition = Joi.object({
        title: Joi.string().min(3).max(50).trim().strict(), // kiểu dữ liệu của title là string
        description: Joi.string().min(3).max(256).trim().strict(), // kiểu dữ liệu của title là string
        type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE)
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

const moveCardToDifferentColumn = async (req, res, next) => {
    // tạo điều kiện để valid body
    const correctCondition = Joi.object({
        currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

        prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        prevCardOrderIds: Joi.array().required().items(
            Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
        ),

        nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        nextCardOrderIds: Joi.array().required().items(
            Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
        )
    })
    try {
        await correctCondition.validateAsync(req.body, {
            abortEarly: false, // trả về nhiều lỗi nếu có
        })
        next()
    } catch (error) {
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}
export const boardValidation = {
    createNew,
    update,
    moveCardToDifferentColumn
}