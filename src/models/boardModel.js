/**
 * Updated by trungquandev.com's author on Oct 8 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from 'joi'
import { ObjectId, ReturnDocument } from "mongodb"
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
import { pagingSkipValue } from '~/utils/algorithms'
import { userModel } from './userModel'
// Define Collection (name & schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    slug: Joi.string().required().min(3).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
    // Lưu ý các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
    columnOrderIds: Joi.array().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),

    // nhung admin cua board
    ownerIds: Joi.array().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),

    // nhung member cua board
    memberIds: Joi.array().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),

    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ["_id", "createdAt"]

const validateBeforeCreate = async (data) => {
    return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (userId, data) => {
    try {
        const validData = await validateBeforeCreate(data)
        const newBoardToAdd = {
            ...validData,
            ownerIds: [
                new ObjectId(userId)
            ]
        }
        return await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd)
    } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
    try {
        return await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
            _id: new ObjectId(id)
        })
    } catch (error) { throw new Error(err) }
}

const getDetails = async (userId, boardId) => {
    try {
        const queryConditions = [
            {
                _id: new ObjectId(boardId),
            },
            {
                _destroy: false
            },
            {
                $or: [
                    { ownerIds: { $all: [new ObjectId(userId)] } },
                    { memberIds: { $all: [new ObjectId(userId)] } }
                ]
            }

        ]

        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
            { $match: { $and: queryConditions } },
            {
                $lookup: {
                    from: columnModel.COLUMN_COLLECTION_NAME,
                    localField: '_id',
                    foreignField: 'boardId',
                    as: 'columns'
                }
            },
            {
                $lookup: {
                    from: cardModel.CARD_COLLECTION_NAME,
                    localField: '_id',
                    foreignField: 'boardId',
                    as: 'cards'
                }
            },
            {
                $lookup: {
                    from: userModel.USER_COLLECTION_NAME,
                    localField: 'ownerIds',
                    foreignField: '_id',
                    as: 'owners',
                    pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
                }
            },
            {
                $lookup: {
                    from: userModel.USER_COLLECTION_NAME,
                    localField: 'memberIds',
                    foreignField: '_id',
                    as: 'members',
                    pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
                }
            }
        ]).toArray()
        return result[0] || null
    } catch (error) { throw new Error(error) }
}

const pushColumnOrderIds = async (column) => {
    try {
        return await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            {
                _id: new ObjectId(column.boardId)
            },
            {
                $push: {
                    columnOrderIds: new ObjectId(column._id)
                }
            },
            {
                returnDocument: 'after' // trả về bản ghi đã được cập nhật
            }
        )
    } catch (error) { throw new Error(error) }
}

const pullColumnOrderIds = async (column) => {
    try {
        return await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            {
                _id: new ObjectId(column.boardId)
            },
            {
                $pull: {
                    columnOrderIds: new ObjectId(column._id)
                }
            },
            {
                returnDocument: 'after' // trả về bản ghi đã được cập nhật
            }
        )
    } catch (error) { throw new Error(error) }
}


const update = async (boardId, updateData) => {
    try {
        // lọc delete các field không cho update
        Object.keys(updateData).forEach(fieldName => {
            if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
                delete updateData[fieldName]
            }
        })

        if (updateData?.columnOrderIds) {
            updateData.columnOrderIds = updateData.columnOrderIds(_id => new ObjectId(_id))
        }
        return await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(boardId) },
            {
                $set: {
                    ...updateData
                }
            },
            {
                returnDocument: 'after' // trả về bản ghi đã được cập nhật
            }
        )
    } catch (error) { throw new Error(error) }
}

const getBoards = async (userId, page, itemsPerPage) => {
    try {
        const queryConditions = [
            // dieu kien 1 : board chua bi xoa
            {
                _destroy: false
            },
            // dieu kien 2 : user thuộc ownerIds hoặc member của board
            {
                $or: [
                    { ownerIds: { $all: [new ObjectId(userId)] } },
                    { memberIds: { $all: [new ObjectId(userId)] } }
                ]
            }

        ]
        const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
            [
                { $match: { $and: queryConditions } },
                { $sort: { title: 1 } },
                // facet để xử lý nhiều luồng trong 1 query
                {
                    $facet: {
                        // Luồng 1: query boards
                        'queryBoards': [
                            {
                                $skip: pagingSkipValue(page, itemsPerPage), // bỏ qua số lượng bản ghi của những page trước đó 
                            },
                            {
                                $limit: itemsPerPage // giới hạn tối đa số lượng bản ghi trả về trên 1 page
                            }
                        ],
                        // luồng 2: query đếm tổng số lượng bản ghi board trong db và trả về vào biến countedAllBoards
                        'queryTotalBoards': [{ $count: 'countedAllBoards' }]
                    }
                }
            ],
            {
                // fix B và a trong ascii vì B đứng trước a
                collation: { locale: 'en' }
            }
        ).toArray()
        const res = query[0]
        return {
            boards: res.queryBoards || [],
            totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
        }
    } catch (error) { throw new Error(error) }
}

export const boardModel = {
    BOARD_COLLECTION_NAME,
    BOARD_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    getDetails,
    pushColumnOrderIds,
    update,
    pullColumnOrderIds,
    getBoards
}