import Joi, { valid } from "joi"
import { ObjectId } from "mongodb"
import { GET_DB } from "~/config/mongodb"


const USER_COLLECTION_NAME = "users"
const USER_COLLECTION_SCHEMA = Joi.object({
    username: Joi.string().required().min(10).max(50).trim().strict(),
    hashsedPasswrod: Joi.string().required().trim().strict(),
    email: Joi.string().required().max(30).trim().strict(),
    displayName: Joi.string().required().trim().strict(),
    avatarUrl: Joi.string().max(500).trim().strict().default(''),
    avatarId: Joi.string().max(50).trim().strict().default(''),
    bio: Joi.string().max(500).trim().strict().default(''),
    phone: Joi.string().max(11).trim().strict().default(''),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null)
})

const validateBeforeCreate = async (data) => {
    return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        return await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
    } catch (error) {
        throw new Error(error)
    }
}

const findOneByUsername = async (username) => {
    try {
        return await GET_DB().collection(USER_COLLECTION_NAME).findOne({
            username
        })
    } catch (error) {
        throw new Error(error)
    }
}


export const userModel = {
    USER_COLLECTION_NAME,
    USER_COLLECTION_NAME,
    findOneByUsername,
    createNew
}