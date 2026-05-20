import type { Request, Response } from "express";
import { userService } from "./user.service";

const userSignup=async(req:Request,res:Response)=>{
   try {
    const result=await userService.signUpUserIntoDb(req.body)
    res.status(200).json({
        success:true,
        message:"user register successfully",
        data:result.rows[0]
    })
    
    
   } catch (error:any) {
    res.status(500).json({
      success:false,
      message:error.message,
      data:null,
    });
    
   }

}

export const userController={
    userSignup,
}