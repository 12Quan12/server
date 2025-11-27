/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import 'dotenv/config'

export const env = {
    MONGODB_URI: process.env.MONGODB_URI,
    DATABASE_NAME: process.env.DATABASE_NAME,

    LOCAL_DEV_APP_HOST: process.env.LOCAL_DEV_APP_HOST,
    LOCAL_DEV_APP_PORT: process.env.LOCAL_DEV_APP_PORT,

    BUILD_MODE: process.env.BUILD_MODE,

    AUTHOR: process.env.AUTHOR,

    //zalo config
    IMEI: process.env.IMEI,
    COOKIE_ZALO: process.env.COOKIE_ZALO,
    SECRET_KEY: process.env.SECRET_KEY,

    WEBSITE_DOMAIN_DEVELOPMENT: process.env.WEBSITE_DOMAIN_DEVELOPMENT,
    WEBSITE_DOMAIN_PRODUCTION: process.env.WEBSITE_DOMAIN_PRODUCTION
}