/* eslint-disable no-useless-catch */
import ApiError, {} from '~/utils/ApiError'
import { slugify } from '~/utils/formatters'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }


    //Gọi tới tầng model để xử lý lưu bản ghi newBoard vào trong database

    return newBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew
}
