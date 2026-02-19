import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res) => {

  try {
    console.log(req.body)
    res.status(StatusCodes.CREATED).json({ message: 'POST Controller: API create new broad.' })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      error: error.message
    })
  }
}

export const boardController = { createNew }