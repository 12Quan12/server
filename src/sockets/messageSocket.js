/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */


export const messageSocket = (socket) => {
    socket.on('message', (data) => {
        console.log(data)
        socket.emit("recei_message", { data })
    })
}