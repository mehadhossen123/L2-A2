import dotenv from 'dotenv'
import path from 'path'
dotenv.config({
    path:path.join(process.cwd(),".env")
})

const config = {
  port: process.env.PORT,
  db_string: process.env.DB_STRING,
};

export default config