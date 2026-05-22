import type { Request, Response } from "express";
import { userService } from "./user.service";
import { handleRequestResponse, handleResponseError } from "../../utility/handleError";



// user signup 
const userSignup=async(req:Request,res:Response)=>{
   try {
    const result=await userService.signUpUserIntoDb(req.body)
    handleRequestResponse(
      res,
      true,
      "User signup successfully",
      result.rows[0],
      200,
    );
    
    
   } catch (error:any) {
   handleResponseError(res,error)
    
   }

}

// user login 
const userLogin=async(req:Request,res:Response)=>{
   
    try {
         const { email, password } = req.body;
      const result = await userService.loginUserIntoDb(email as string,password as string);
     handleRequestResponse(
       res,
       true,
       "User login successfully",
       result,
       200,
     );
    } catch (error: any) {
     handleResponseError(res,error)
    }

}


export const userController={
    userSignup,
    userLogin,
    
}