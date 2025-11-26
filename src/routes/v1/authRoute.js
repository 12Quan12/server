import express from "express"
import { authController } from "~/controllers/auth"
import { authValidation } from "~/validations/authValidation"
const Router = express.Router()

Router.route("/signup")
    .post(authValidation.signUp, authController.signUp)

Router.route("/signin")
    .post(authValidation.signIn, authController.signIn)

Router.route("/signout")
    .post(authController.signOut)

export const authRouter = Router