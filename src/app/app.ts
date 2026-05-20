import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { userRouter } from "../modules/users/user.router";






const app: Application = express();

app.use(express.json());






app.use(" /api/auth",userRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("this is the DevPulse server");
});
export default app

