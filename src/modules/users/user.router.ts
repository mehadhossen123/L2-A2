import { Router } from "express";
import { userController } from "./user.controller";


const router=Router();
router.post("/signup",userController.userSignup)
router.post("/login",userController.userLogin)





export const userRouter=router;