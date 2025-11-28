/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { slugify } from "~/utils/formaters"
import { boardModel } from "~/models/boardModel"
import ApiError from "~/utils/ApiError"
import { StatusCodes } from "http-status-codes"
import { cloneDeep } from "lodash"
import { columnModel } from "~/models/columnModel"
import { cardModel } from "~/models/cardModel"
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from "~/utils/constants"
const createNew = async (reqBody) => {
    try {
        const newBoard = {
            ...reqBody,
            slug: slugify(reqBody.title)
        }
        const createdBoard = await boardModel.createNew(newBoard)
        const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
        return getNewBoard
    } catch (error) {
        throw error
    }
}

const update = async (boardId, reqBody) => {
    try {
        const updateData = {
            ...reqBody,
            updatedAt: Date.now()
        }
        const updatedBoard = await boardModel.update(boardId, updateData)
        return updatedBoard
    } catch (error) {
        throw error
    }
}


const moveCardToDifferentColumn = async (reqBody) => {
    try {
        await columnModel.update(reqBody.prevColumnId, {
            cardOrderIds: reqBody.prevCardOrderIds,
            updatedAt: new Date.now()
        })
        await columnModel.update(reqBody.nextColumnId, {
            cardOrderIds: reqBody.nextCardOrderIds,
            updatedAt: new Date.now()
        })
        await cardModel.update(reqBody.currentCardId, {
            columnId: reqBody.nextColumnId
        })
        const updatedBoard = await boardModel.update(boardId, updateData)
        return { updateReuslt: "Success" }
    } catch (error) {
        throw error
    }
}

const getDetails = async (boardId) => {
    try {
        const board = await boardModel.getDetails(boardId)
        if (!board) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!!!')
        const resBoard = cloneDeep(board) // tạo ra cái mới không ảnh hưởng tới cái cũ (ban đầu)
        resBoard?.columns?.forEach(column => {
            column.cards = resBoard?.cards?.filter(card => card?.columnId?.equals(column?._id))
        })
        delete resBoard.cards
        return resBoard
    } catch (error) {
        throw error
    }
}

const getBoards = async (userId, page, itemsPerPage) => {
    try {
        if (!page || +page > 24) page = DEFAULT_PAGE
        if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE
        return await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10))
    } catch (error) { throw error }
}

export const boardService = {
    createNew,
    update,
    getDetails,
    moveCardToDifferentColumn,
    getBoards
}