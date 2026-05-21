import { json, type NextFunction, type Request, type Response } from "express";
import Jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db/db";


export const isAuthenticated = () => {
  return async (req:Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access !!",
      });
    }
    /*akhane asle tar mane token ase . tai token take decoded korbo  dekbo lok ta balid kina
     */
    const decodedToken = Jwt.verify(
      token as string,
      config.access_token_key as string,
    ) as JwtPayload;
    //  akhon dekbo ai email diye user ta ki database a ase kina.
    const existsUser = await pool.query(
      `
        SELECT *FROM users WHERE email=$1
        `,
      [decodedToken?.email],
    );
    const user = existsUser.rows[0];
    if (existsUser.rows.length == 0) {
      res.status(404).json({
        success: false,
        message: "User not found in database !!",
      });
    }

    if (
      !user?.role.includes("contributor") &&
      !user?.role.includes("maintainer")
    ) 
    {
        res.status(403).json({
            success:false,
            message:"Forbidden !!"
        })
    }
    req.user=decodedToken 
    next();
  };
};
