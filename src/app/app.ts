import express, {
  type Application,
  type Request,
  type Response,
} from "express";






const app: Application = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("this is the DevPulse server");
});
export default app

