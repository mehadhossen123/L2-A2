import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { userRouter } from "../modules/users/user.router";
import error from "../globalError/error";

const app: Application = express();

app.use(express.json());



// module middle ware


app.use("/api/auth",userRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("this is the DevPulse server");
});
app.use(error)
export default app

