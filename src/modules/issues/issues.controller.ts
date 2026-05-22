import type { Request, Response } from "express";
import type { TIssue } from "../../type/type";
import { issuesService } from "./issues.service";
import { handleRequestResponse, handleResponseError } from "../../utility/handleError";

// create issue
const createIssue = async (req: Request, res: Response) => {
  try {
    const currentUser = req?.user;

    const result = await issuesService.createIssuesIntoDb(
      currentUser as TIssue,
      req.body,
    );
   

  handleRequestResponse(
    res,
    true,
    "issue created successfully",
    result.rows[0],
    200,
  );


  } catch (error: any) {
   handleResponseError(res,error)
  }
};

// get all issue by filtering type,status
const getAllIssues = async (req: Request, res: Response) => {
  try {
    const { sort, type, status } = req.query;

    const result = await issuesService.getAllIssuesFromDb(
      sort as string,
      type as string,
      status as string,
    );

    
  handleRequestResponse(
    res,
    true,
    "issue get successfully",
    result,
    200,
  );

  } catch (error: any) {
     handleResponseError(res, error);
  }
};

// get all single issue

// get all issue by filtering type,status
const getSingleIssues = async (req: Request, res: Response) => {
  try {
    const id = req?.params?.id;
    console.log("requeste id ", id);

    const result = await issuesService.getSingleIssuesFromDb(id);

    handleRequestResponse(
      res,
      true,
      "issue get successfully",
      result,
      200,
    );
  } catch (error: any) {
     handleResponseError(res, error);
  }
};

// update  single issues
const updateSingleIssues = async (req: Request, res: Response) => {
  try {
    const id = req?.params?.id;

    const result = await issuesService.updateSingleIssuesFromDb(req.body, id);

    handleRequestResponse(
      res,
      true,
      "issue updated successfully",
      result.rows[0],
      200,
    );
  } catch (error: any) {
     handleResponseError(res, error);
  }
};

// delete a single issue
const deleteSingleIssues = async (req: Request, res: Response) => {
  try {
    const id = req?.params?.id;

    const result = await issuesService.deleteSingleIssuesFromDb(id);

    // res.status(200).json({
    //   success: true,
    //   message: "Issue deleted successfully",
      
    // });
    handleRequestResponse(
      res,
      true,
      "issue deleted successfully",
      null,
    
      200,
    );


  } catch (error: any) {
     handleResponseError(res, error);
  }
};

export const issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssues,
  updateSingleIssues,
  deleteSingleIssues,
};
