import { Router } from "express";

import { issuesController } from "./issues.controller";
import { createIssueAuth } from "../../middleware/auth.issue";

const router=Router();
// create issue
router.post("/", createIssueAuth(), issuesController.createIssue);
// get all issues
router.get("/",issuesController.getAllIssues);
// get single issues 
router.get("/:id",issuesController.getSingleIssues)
// update single issues
router.patch("/:id", issuesController.updateSingleIssues);
export const issuesRouter=router;