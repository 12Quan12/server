/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import express from 'express'
import cors from "cors"
import { corsOptions } from "~/config/cors"
import exitHook from 'async-exit-hook'
import { CONNECT_DB, GET_DB, CLOSE_DB } from "~/config/mongodb"
import { env } from "~/config/environment"
import { APIs_V1 } from "~/routes/v1"
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import cookieParser from 'cookie-parser'
import http from "http"
import socketIo from "socket.io"
import { messageSocket } from './sockets/messageSocket'

const START_SERVER = () => {
  const app = express()
  // https://stackoverflow.com/53240717/8324172
  // fix Cache from disk của Express
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // cấu hình cookie parser
  app.use(cookieParser())
  // cấu hình cors
  app.use(cors(corsOptions))
  // enable req.body data
  app.use(express.json())
  // use APIs v1
  app.use('/v1', APIs_V1)

  // middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // tạo một server mới bọc thằng app của express làm realtime với socket.io
  const server = http.createServer(app)
  // khởi tạo biến io với server và cors
  const io = socketIo(server, {
    cors: corsOptions
  })

  io.on("connection", (socket) => {
    messageSocket(socket)
  })

  // dùng server để listen
  if (env.BUILD_MODE == "production") {
    server.listen(process.env.PORT, async () => {
      // eslint-disable-next-line no-console
      console.log(`Production : Hello ${env.AUTHOR}, I am running at port:${process.env.PORT}`)
    })
  } else {
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, async () => {
      // eslint-disable-next-line no-console
      console.log(`Dev : Hello ${env.AUTHOR}, I am running at ${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}`)
    })
  }

  // lắng nghe crash app để đóng kết nối DB
  exitHook((signal) => {
    console.log(`exit app`)
    CLOSE_DB()
    console.log(`exit app`)
  })
}

CONNECT_DB()
  .then(() => {
    console.log("Connected to mongoDB!")
  })
  .then(() => START_SERVER())
  .catch(err => {
    console.error(err)
    process.exit()
  })