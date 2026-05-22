import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth.issue";
import { issuesController } from "./issues.controller";

const router=Router();
// create issue
router.post("/", isAuthenticated(), issuesController.createIssue);
router.get("/",issuesController.getAllIssues);
router.get("/:id",issuesController.getSingleIssues)
export const issuesRouter=router;