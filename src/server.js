/* eslint-disable no-console */
import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, GET_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'

const START_SERVER = () => {
  const app = express()

  //Enable json data
  app.use(express.json())

  //Use APIs v1
  app.use('/v1', APIs_V1)

  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  app.get('/', async (req, res) => {
    console.log( await GET_DB().listCollections().toArray())

    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log(`Hello, Backend Server running at ${ env.APP_HOST }:${ env.APP_PORT }/`)
  })

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
