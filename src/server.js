import express from "express"

const app = express()
const HOSTNAME = 'localhost'
const PORT = 8017

app.get("/", (req, res) => {
    res.send("<h1>hello</h1>")
})

app.listen(PORT, HOSTNAME, () => {
    console.log(`sever is running from  http://${HOSTNAME}:${PORT}`)
})