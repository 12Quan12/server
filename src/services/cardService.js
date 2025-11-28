/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { cardModel } from "~/models/cardModel"
import { columnModel } from "~/models/columnModel"
import { cloudinaryProvider } from "~/providers/cloudinaryProvider"
const createNew = async (reqBody) => {
    try {
        const newCard = {
            ...reqBody
        }
        const createdCard = await cardModel.createNew(newCard)
        const getNewCard = await cardModel.findOneById(createdCard.insertedId)
        if (getNewCard) {
            await columnModel.pushCardOrderIds(getNewCard)
        }
        return getNewCard
    } catch (error) {
        throw error
    }
}

const update = async (cardId, reqBody, cardCoverFile) => {
    try {
        const updateData = {
            ...reqBody,
            updatedAt: Date.now()
        }
        let updatedCard = {}
        if (cardCoverFile) {
            const uploadResult = await cloudinaryProvider.streamUpload(cardCoverFile.buffer, "card-corvers")
            // lưu lại url của file vừa upload vào database
            updatedCard = await cardModel.update(cardId, {
                cover: uploadResult.secure_url
            })
        } else {
            updatedCard = await cardModel.update(cardId, updateData)
        }
        return updatedCard
    } catch (error) {
        throw error
    }
}

export const cardService = {
    createNew,
    update
}