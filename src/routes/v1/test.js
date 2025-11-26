import express from "express"
import { protectedRoute } from "~/middlewares/authMiddleware"
const Router = express.Router()

Router.route("/")
    .get(protectedRoute, (req, res, netx) => {
        return res.status(200).json({
            messages: "auth sucess"
        })
    })
export const testRouter = Router