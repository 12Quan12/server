import Joi from "joi"
import { GET_DB } from "~/config/mongodb"
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const SESSION_COLLECTION_NAME = "sessions"
const SESSION_COLLECTION_SCHEMA = Joi.object({
    userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    refreshToken: Joi.string().required(),
    expiresAt: Joi.date().required().timestamp('javascript'),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null)
})

const createNew = async (data) => {
    try {
        await GET_DB().collection(SESSION_COLLECTION_NAME).insertOne(data)
    } catch (error) { throw new Error(error) }
}

const deteleToken = async (data) => {
    try {
        await GET_DB().collection(SESSION_COLLECTION_NAME).deleteOne(data)
    } catch (error) { throw new Error(error) }
}

export const sessionModel = {
    SESSION_COLLECTION_NAME,
    SESSION_COLLECTION_SCHEMA,
    createNew,
    deteleToken
}
