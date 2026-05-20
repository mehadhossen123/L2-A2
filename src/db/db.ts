import { Pool } from "pg";
import config from "../config";

// connect database into server 
export const pool = new Pool({
  connectionString: config.db_string,
});
export const initDb = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'contributor',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()

        )
        
        `);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description VARCHAR(50) NOT NULL CHECK(LENGTH(description)>=20),
            type VARCHAR (50) CHECK (type IN('bug','feature_request')) ,
            status VARCHAR(50) DEFAULT 'open' CHECK(status IN ('open','in_progress','resolved')),
            reporter_id INT NOT NULL ,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )

            `);
    console.log("database connected successfully");
  } catch (error) {
    console.log(error);
  }
};

