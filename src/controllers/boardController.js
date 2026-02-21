import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {

  try {
    // console.log(req.body)

    // Điều hướng dữ liệu sang tầng Services
    const createdBoard = await boardService.createNew(req.body)

    // Có kết quả trả về về phía client
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) { next(error) }
}

export const boardController = { createNew }
