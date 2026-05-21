import { Router } from "express";
import { userController } from "./user.controller";
import { isAuthenticated } from "../../middleware/auth.issue";

const router=Router();
router.post("/signup",userController.userSignup)
router.post("/login",userController.userLogin)
router.post("/issues",isAuthenticated(),userController.createIssue)



export const userRouter=router;