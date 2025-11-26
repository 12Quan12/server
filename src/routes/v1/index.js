/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import express from "express"
import { StatusCodes } from "http-status-codes"
import { authRouter } from "~/routes/v1/authRoute"
import { testRouter } from "~/routes/v1/test"
const Router = express.Router()

// kiểm tra status API v1
Router.get('/status', (req, res) => res.status(StatusCodes.OK).json({ message: "APIs v1 are ready to use." }))

Router.use('/auth', authRouter)
Router.use('/test', testRouter)

export const APIs_V1 = Router