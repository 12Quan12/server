import JWT from "jsonwebtoken"

const generateToken = async (userInfo, secretSignarute, tokenLife) => {
    try {
        return JWT.sign(userInfo, secretSignarute, {
            algorithm: 'HS256',
            expiresIn: tokenLife
        })
    } catch (error) { throw new Error(error) }
}

const verifyToken = async (token, secretSignarute) => {
    try {
        return JWT.verify(token, secretSignarute)
    } catch (error) { throw new Error(error) }
}


export const jwtProvider = {
    generateToken,
    verifyToken
}