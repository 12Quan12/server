/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { MongoClient, ServerApiVersion } from "mongodb"
import { env } from "~/config/environment"

// khởi tạo đối tượng databaseInstace ban đầu là null vì chưa connect
let dataBaseInstace = null

// Khởi tạo 1 đối tượng Instace để kết nối tới mongoDB
const mongoClientInstace = new MongoClient(env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1, // 
        strict: true,
        deprecationErrors: true
    }
})

// kết nối tới database
export const CONNECT_DB = async () => {
    // gọi kết nối tới mongoDB
    await mongoClientInstace.connect()

    // kết nối thành công thì gán vào dataBaseInstace
    dataBaseInstace = await mongoClientInstace.db(env.DATABASE_NAME)
}

export const CLOSE_DB = async () => {
    await mongoClientInstace.close()
}

export const GET_DB = () => {
    if (!dataBaseInstace) throw new Error("Must connect to Database first!!!")
    return dataBaseInstace
}
