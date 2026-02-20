import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'

// khởi tạo một đối tượng ban đầu là null ( chưa connect)
let trelloDatabaseInstance = null

// connect tới mongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

//connect tới database
export const CONNECT_DB = async () => {
  // Gọi tới mongo Atlas
  await mongoClientInstance.connect()

  // Lấy database theo tên gán lại
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}

export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Must connect to Database first')
  return trelloDatabaseInstance
}
