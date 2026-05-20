import app from "./app/app";
import config from "./config";
import { initDb } from "./db/db";

export const main = () => {
  // here we have to start te server
  initDb();
  app.listen(config.port, () => {
    console.log(`the server is running on port :${config.port}`);
  });
};
main()