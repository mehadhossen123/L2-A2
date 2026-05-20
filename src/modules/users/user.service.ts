
import { pool } from "../../db/db";
import type { User } from "../../type/type";
import bcrypt from 'bcrypt'

const signUpUserIntoDb = async (payload: User) => {
  const { name, email, password, role } = payload;
  const has_pass=await bcrypt.hash(password,10)
  const result = await pool.query(
    `INSERT INTO users (name,email,password,role) VALUES($1,$2,$3,COALESCE($4,'contributor')) RETURNING*`,
    [name, email, has_pass, role],
  );
  delete result.rows[0].password;
  return result
};

export const userService = {
  signUpUserIntoDb,
};
