import dotenv from 'dotenv'
import path from 'path'
dotenv.config({
    path:path.join(process.cwd(),".env")
})

const config = {
  port: process.env.PORT,
  db_string: process.env.DB_STRING,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
};

export default config