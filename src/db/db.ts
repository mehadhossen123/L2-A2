import { Pool } from "pg";
import config from "../config";

// connect database into server
const pool = new Pool({
  connectionString: config.db_string,
});
export const initDb = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(20) NOT NULL,
        email VARCHAR(20) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'contributor',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()

        )
        `);
    console.log("database connected successfully");
  } catch (error) {
    console.log(error);
  }
};

