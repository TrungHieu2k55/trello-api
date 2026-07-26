import { userModel } from '~/models/userModel'
import ApiError, {} from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { ResendProvider } from '~/providers/ResendProvider'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'


const createNew = async(reqBody) => {
  try {
    // Kiểm tra email đã tồn tại chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }

    //Tạo data để lưu vào database
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),
      userName: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    //Thực hiện lưu vào database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // Gửi email cho người dùng xác thực tk
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Trello Please verify your email before using our services!'
    const htmlContent = `
      <h3>Here is your verificatiton link!</h3>
      <h3>${verificationLink}</h3>
    `
    await ResendProvider.sendMail({ to: getNewUser.email, subject: customSubject, html: htmlContent })

    //return về phía controller
    return pickUser(getNewUser)
  }
  catch (error) {throw error}
}

const verifyAccount = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_FOUND, 'Your account is already active!')
    if (reqBody.token !== existUser.verifyToken) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')
    }

    const updateData = {
      isActive: true,
      verifyToken: null
    }

    const updatedUser = await userModel.update(existUser._id, updateData)

    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)

    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Email or Password is incorrect!')
    }

    //Token
    const userInfo = { id: existUser._id, email: existUser.email }

    // Tạo Access Token (token dùng để xác thực người dùng khi gọi API)
    // Token này có thời gian sống ngắn (ví dụ: 15 phút, 1 giờ...)
    const accessToken = await JwtProvider.generateToken(
      userInfo, // Payload: thông tin sẽ được lưu trong token (id, email, role,...)
      env.ACCESS_TOKEN_SECRET_SIGNATURE, // Secret key dùng để ký Access Token
      env.ACCESS_TOKEN_LIFE // Thời gian hết hạn của Access Token
    )

    // Tạo Refresh Token (token dùng để cấp lại Access Token khi Access Token hết hạn)
    // Token này thường có thời gian sống dài hơn (ví dụ: 7 ngày, 30 ngày...)
    const refreshToken = await JwtProvider.generateToken(
      userInfo, // Payload của Refresh Token
      env.REFRESH_TOKEN_SECRET_SIGNATURE, // Secret key dùng để ký Refresh Token
      env.REFRESH_TOKEN_LIFE // Thời gian hết hạn của Refresh Token
    )

    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {
    throw error
  }
}

const refreshToken = async(clientRefreshToken) => {
  try {
    // Verify refresh token
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)
    const userInfo = {
      id: refreshTokenDecoded.id,
      email: refreshTokenDecoded.email
    }

    //Tạo access token mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE //
    )

    return { accessToken }
  } catch (error) {
    throw error
  }
}

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    // Query User và kiểm tra cho chắc chắn
    const existUser = await userModel.findOneById(userId)

    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')

    if (!existUser.isActive)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')

    // Khởi tạo kết quả updated User ban đầu là empty
    let updatedUser = {}

    // Trường hợp change password
    if (reqBody.current_password && reqBody.new_password) {
      // Kiểm tra xem cái current_password có đúng hay không
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)
      ) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your Current Password is incorrect!')
      }

      // Nếu như current_password là đúng thì chúng ta sẽ hash một cái mật khẩu mới và update lại vào DB:
      updatedUser = await userModel.update(existUser._id, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })
    } else if (userAvatarFile) {
      const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')

      // Lưu url vào database
      updatedUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url
      })
    } else {
      // Trường hợp update các thông tin chung, ví dụ như displayName
      // console.log(reqBody)
      updatedUser = await userModel.update(existUser._id, reqBody)
      // console.log('pickUser1', updatedUser)
    }
    // console.log('pickUser2', updatedUser)
    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}
