import { json, type NextFunction, type Request, type Response } from "express";
import Jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db/db";

// issue created validation is here
export const createIssueAuth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
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
    ) {
      res.status(403).json({
        success: false,
        message: "Forbidden !!",
      });
    }
    req.user = decodedToken;
    next();
  };
};

// issues updated validation is here
export const updatedIssueAuth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    const issueId = req.params.id;
    if (!token) {
      return res.status(401).json({
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

    if (existsUser.rows.length == 0) {
      return res.status(404).json({
        success: false,
        message: "User not found in database !!",
      });
    }

    const currentUser = existsUser.rows[0];
    const currentUserId = currentUser.id;
    const currentUserRole = currentUser.role;
    const currentUserIssue = await pool.query(
      `
  SELECT *FROM issues WHERE id=$1
  `,
      [issueId],
    );

    if (!currentUserIssue.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Issues not found",
      });
    }

    // updated all issues because he is maintainer
    if (currentUserRole == "maintainer") {
      return next();
    }

    {
      // id na mille
      if (
        currentUserIssue.rows[0].reporter_id !== currentUserId &&
        currentUserIssue.rows[0].status == "open"
      ) {
        return res.status(404).json({
          message: "this is not your issues",
        });
      }
      //  status open na hole

      if (currentUserRole == "contributor") {
        if (
          currentUserIssue.rows[0].reporter_id == currentUserId &&
          currentUserIssue.rows[0].status == "open"
        ) {
          return next();
        }
      }

      return res.status(403).json({
        success: false,
        message: "forbidden",
      });
    }
  };
};


// issues deleted validation 
export const deleteIssueAuth=()=>{
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    const issueId = req.params.id;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access !!",
      });
    }
    //khane asle tar mane token ase . tai token take decoded korbo  dekbo lok ta balid kina
    
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

    if (existsUser.rows.length == 0) {
      return res.status(404).json({
        success: false,
        message: "User not found in database !!",
      });
    }

    const currentUser = existsUser.rows[0];
   
    const currentUserRole = currentUser.role;
    const currentUserIssue = await pool.query(
      `
  SELECT *FROM issues WHERE id=$1
  `,
      [issueId],
    );

    if (!currentUserIssue.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Issues not found",
      });
    }

    // deleted all issues because he is maintainer
    if (currentUserRole == "maintainer") {
      return next();
    }
}
}
