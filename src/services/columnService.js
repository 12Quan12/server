/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { StatusCodes } from "http-status-codes"
import { boardModel } from "~/models/boardModel"
import { cardModel } from "~/models/cardModel"
import { columnModel } from "~/models/columnModel"
import ApiError from "~/utils/ApiError"
const createNew = async (reqBody) => {
    try {
        const newColumn = {
            ...reqBody
        }
        const createdColumn = await columnModel.createNew(newColumn)
        const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)
        if (getNewColumn) {
            getNewColumn.cards = []
            await boardModel.pushColumnOrderIds(getNewColumn)
        }
        return getNewColumn
    } catch (error) {
        throw error
    }
}

const update = async (columnId, reqBody) => {
    try {
        const updateData = {
            ...reqBody,
            updatedAt: Date.now()
        }
        const updatedColumn = await columnModel.update(columnId, updateData)
        return updatedColumn
    } catch (error) {
        throw error
    }
}

const deleteItem = async (columnId) => {
    try {
        const targetColumn = await columnModel.findOneById(columnId)
        if (!targetColumn) throw new ApiError(StatusCodes.NOT_FOUND, "Column not found!!!")
        // xóa column
        await columnModel.deleteOneByIt(columnId)
        // xóa toàn bộ card thuộc column ID
        await cardModel.deleteManyByColumsId(columnId)
        // xóa colum id trong mảng columnIds của board
        await boardModel.pullColumnOrderIds(targetColumn)
        return { deletedResult: "Column and its Cards deleted successfully" }
    } catch (error) {
        throw error
    }
}

export const columnService = {
    createNew,
    update,
    deleteItem
}