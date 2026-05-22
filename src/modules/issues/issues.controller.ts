import type { Request, Response } from "express";
import type { TIssue } from "../../type/type";
import { issuesService } from "./issues.service";

// create issue
const createIssue = async (req: Request, res: Response) => {
  try {
    const currentUser = req?.user;

    const result = await issuesService.createIssuesIntoDb(
      currentUser as TIssue,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: "issue created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};




// get all issue by filtering type,status 
const getAllIssues=async(req:Request,res:Response)=>{
    try {
    const {sort,type,status}=req.query;
   

      const result = await issuesService.getAllIssuesFromDb(sort as string,type as string,status as string) 
     
      res.status(200).json({
        success: true,
        message: "issue get successfully",
        data:result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

}

// get all single issue

// get all issue by filtering type,status 
const getSingleIssues=async(req:Request,res:Response)=>{
    try {
    const id=req?.params?.id;
    console.log("requeste id ",id);
   

      const result = await issuesService.getSingleIssuesFromDb(id )
     
      res.status(200).json({
        success: true,
        message: "issue get successfully",
        data:result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

}



export const issuesController={
    createIssue,
    getAllIssues,
    getSingleIssues,
}