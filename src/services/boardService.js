/* eslint-disable no-useless-catch */
import ApiError, {} from '~/utils/ApiError'
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }


    //Gọi tới tầng model để xử lý lưu bản ghi newBoard vào trong database
    const createdBoard = await boardModel.createNew(newBoard)


    //Lấy bảng board sau khi gọi
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    return getNewBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew
}
