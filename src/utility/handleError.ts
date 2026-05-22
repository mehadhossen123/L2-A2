import type { Response } from "express";

export const handleResponseError=(res:Response,error:any)=>{
    return res.status(500).json({
        success:false,
        message:error.message,
        data:null
    })
}


export const handleRequestResponse=(res:Response, success:boolean,message:string,data:any,statusCode:number)=>{
    return res.status(statusCode).json({
        success:success,
        message:message,
        data:data
    })
}