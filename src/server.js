/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, GET_DB, CLOSE_DB } from "~/config/mongodb"
import { env } from "~/config/environment"
const app = express()

const START_SERVER = () => {
  app.get('/', (req, res) => {
    res.end('<h1>Hello World!</h1><hr>')
  })
  app.listen(env.APP_PORT, env.APP_HOST, async () => {
    // console.log(await GET_DB().listCollections().toArray())
    // eslint-disable-next-line no-console
    console.log(`Hello ${env.AUTHOR}, I am running at ${env.APP_HOST}:${env.APP_PORT}`)
  })

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