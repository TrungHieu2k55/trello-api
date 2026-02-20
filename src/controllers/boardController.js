import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {

  try {
    // console.log(req.body)


    // Có kết quả trả về về phía client
    res.status(StatusCodes.CREATED).json({ message: 'POST Controller: API create new broad.' })
  } catch (error) { next(error) }
}

export const boardController = { createNew }
