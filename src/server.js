/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, GET_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import cookieParser from 'cookie-parser'

import socketIo from 'socket.io'
import http from 'http'

const START_SERVER = () => {
  const app = express()

  //Fix Cache from disk
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // Cấu hình Cookie Parser
  app.use(cookieParser())

  //Xử lý Cors
  app.use(cors(corsOptions))
  //Enable json data
  app.use(express.json())

  //Use APIs v1
  app.use('/v1', APIs_V1)

  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  // Tạo server mới bọc express làm realtime
  const server = http.createServer(app)
  // Khởi tạo biến io với server và cors
  const io = socketIo(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    // Lắng nghe sự kiện emit gửi lên
    socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
      socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
    })
  })

  // Môi trường production (cụ thể hiện tại là đang support render)
  // Dùng server thay vì app vì bao gồm express và socketIo
  if (env.BUILD_MODE === 'production') {
    server.listen(process.env.PORT, () => {
      console.log(`Hello, Backend Server running at port  ${ process.env.PORT}/`)
    })
  } else {
    // Môi trường trên dev
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`Hello, Backend Server running at ${ env.LOCAL_DEV_APP_HOST }:${ env.LOCAL_DEV_APP_PORT }/`)
    })
  }

  // Cleanup trước khi dừng server
  // https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
  exitHook(() => {
    CLOSE_DB()
    console.log('Exit app')
  })
}

// kết nối database mới server lên
CONNECT_DB()
  .then(() => console.log('Connected to MongoDB Cloud Atlas!'))
  .then(() => START_SERVER())
  .catch(error => {
    console.error(error)
    process.exit(0)
  })
