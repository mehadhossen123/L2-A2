import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { userRouter } from "../src/modules/users/user.router";
import error from "../src/globalError/error";
import { issuesRouter } from "../src/modules/issues/issues.router";
import cors from 'cors'

const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);




// module middle ware


app.use("/api/auth",userRouter);
app.use("/api/issues",issuesRouter)

app.get("/", (req: Request, res: Response) => {
  res.send("this is the DevPulse server");
});
app.use(error)
export default app

