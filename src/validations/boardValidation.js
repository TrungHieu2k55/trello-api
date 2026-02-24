import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
  })

  try {
    console.log(req.body)
    // abortEarly trả về tất cả lỗi
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // Validation dữ liệu hợp lệ thì cho request sang controller
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
    // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
    //   error: new Error(error).message
    // })
  }
}

export const boardValidation = { createNew }
