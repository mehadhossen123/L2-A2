
import config from "../../config";
import { pool } from "../../db/db";
import type {  User } from "../../type/type";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// signup user into database
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
// login user into database
const loginUserIntoDb=async(email:string,password:string)=>{
    // Find this email user exist in database  ? 
    const existUser=await pool.query(`
        SELECT *FROM users WHERE email=$1
        `,[email])
     const user=existUser.rows[0];
     if(existUser.rows.length==0){
        throw new Error("Invalid credentials !!")
     }
    //  compare  password between user and  db user 
    const isPasswordMatched=await bcrypt.compare(password,user.password);
    if(!isPasswordMatched){
        throw new  Error("Invalid Password !!")
    }
/*
Jehetu user ase tai akhane tar jonno akta access token make korte hobe . 

 */
const jwtPayload={
    id:user.id,
    name:user?.name,
    email:user?.email,
    role:user?.role
}
const accessToken= jwt.sign(jwtPayload,config.access_token_key as string,{expiresIn:"1d"})
delete user.password
return {accessToken,user}

}




export const userService = {
  signUpUserIntoDb,
  loginUserIntoDb,
 
};
