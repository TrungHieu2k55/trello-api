import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRouter } from '~/routes/v1/boardRoute'
import { columnRouter } from '~/routes/v1/columnRoute'
import { cardRouter } from '~/routes/v1/cardRoute'
import { userRoute } from '~/routes/v1/userRoute'

const Router = express.Router()

//Check APIs v1/status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.' })
})

// Board APIs
Router.use('/boards', boardRouter)

// Column APIs
Router.use('/columns', columnRouter)

// Card APIs
Router.use('/cards', cardRouter)

// User APIs
Router.use('/users', userRoute)


export const APIs_V1 = Router
