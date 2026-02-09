import express from 'express'

const app = express()

const hostname = 'localhost'
const port = 8989

app.get('/', function (req, res) {
    res.send('<h1>Hello chào các bạn</h1>')
})

app.listen(port, hostname, () => {
    console.log(`Hello, Running server at http://${hostname}:${port}/`)
})