import { StatusCodes } from "http-status-codes";
import multer from "multer";
import ApiError from "~/utils/ApiError";
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from "~/utils/validators";

// kiểm tra file nào được chấp nhận
const customFileFilter = (req, file, callback) => {
    // đối với multer kiểm tra kiểu file thì sử dụng mimetype
    if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
        const errMessage = 'File type is invalid!!!'
        callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
    }
    // Nếu như kiểu file hợp lệ
    return callback(null, true)
}

// khởi tạo function upload được bọc bởi thằng multer
const upload = multer({
    limits: {
        fileSize: LIMIT_COMMON_FILE_SIZE
    },
    fileFilter: customFileFilter
})

export const multerUploadMiddleware = {
    upload
}