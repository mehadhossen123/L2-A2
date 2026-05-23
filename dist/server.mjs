

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app/app.ts
import express from "express";

// src/modules/users/user.router.ts
import { Router } from "express";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  port: process.env.PORT,
  db_string: process.env.DB_STRING,
  access_token_key: process.env.ACCESS_TOKEN_KEY
};
var config_default = config;

// src/db/db.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.db_string
});
var initDb = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'contributor',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()

        )
        
        `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL CHECK(LENGTH(description)>=20),
            type VARCHAR (50) CHECK (type IN('bug','feature_request')) ,
            status VARCHAR(50) DEFAULT 'open' CHECK(status IN ('open','in_progress','resolved')),
            reporter_id INT NOT NULL ,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )

            `);
    console.log("database connected successfully");
  } catch (error2) {
    console.log(error2);
  }
};

// src/modules/users/user.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var signUpUserIntoDb = async (payload) => {
  const { name, email, password, role } = payload;
  const has_pass = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name,email,password,role) VALUES($1,$2,$3,COALESCE($4,'contributor')) RETURNING*`,
    [name, email, has_pass, role]
  );
  delete result.rows[0].password;
  return result;
};
var loginUserIntoDb = async (email, password) => {
  const existUser = await pool.query(`
        SELECT *FROM users WHERE email=$1
        `, [email]);
  const user = existUser.rows[0];
  if (existUser.rows.length == 0) {
    throw new Error("Invalid credentials !!");
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Invalid Password !!");
  }
  const jwtPayload = {
    id: user.id,
    name: user?.name,
    email: user?.email,
    role: user?.role
  };
  const accessToken = jwt.sign(jwtPayload, config_default.access_token_key, { expiresIn: "1d" });
  delete user.password;
  return { accessToken, user };
};
var userService = {
  signUpUserIntoDb,
  loginUserIntoDb
};

// src/utility/handleError.ts
var handleResponseError = (res, error2) => {
  return res.status(500).json({
    success: false,
    message: error2.message,
    data: null
  });
};
var handleRequestResponse = (res, success, message, data, statusCode) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};

// src/modules/users/user.controller.ts
var userSignup = async (req, res) => {
  try {
    const result = await userService.signUpUserIntoDb(req.body);
    handleRequestResponse(
      res,
      true,
      "User signup successfully",
      result.rows[0],
      200
    );
  } catch (error2) {
    handleResponseError(res, error2);
  }
};
var userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.loginUserIntoDb(email, password);
    handleRequestResponse(
      res,
      true,
      "User login successfully",
      result,
      200
    );
  } catch (error2) {
    handleResponseError(res, error2);
  }
};
var userController = {
  userSignup,
  userLogin
};

// src/modules/users/user.router.ts
var router = Router();
router.post("/signup", userController.userSignup);
router.post("/login", userController.userLogin);
var userRouter = router;

// src/globalError/error.ts
var error = ((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});
var error_default = error;

// src/modules/issues/issues.router.ts
import { Router as Router2 } from "express";

// src/modules/issues/issues.service.ts
var createIssuesIntoDb = async (payload, body) => {
  const { title, description, type } = body;
  const result = await pool.query(
    `
       INSERT INTO issues(title,description,type,reporter_id) 
        VALUES($1,$2,$3,$4)
        RETURNING *
        `,
    [title, description, type, payload?.id]
  );
  return result;
};
var getAllIssuesFromDb = async (sort, type, status) => {
  let query = `
        SELECT *FROM issues WHERE 1=1
        `;
  if (type) {
    query += ` AND type='${type}'`;
  }
  if (status) {
    query += ` AND status='${status}'`;
  }
  if (sort == "oldest") {
    query += `ORDER BY created_at ASC`;
  }
  if (sort == "newest") {
    query += `ORDER BY created_at DESC`;
  }
  const result = await pool.query(query);
  const issues = result.rows;
  let finalIssue = [];
  for (const issue of issues) {
    const reporter = await pool.query(`
            SELECT * FROM users WHERE id=$1
            `, [issue?.reporter_id]);
    finalIssue.push({
      id: issue?.id,
      title: issue?.title,
      description: issue?.description,
      type: issue?.type,
      status: issue?.status,
      reporter: {
        id: reporter.rows[0].id,
        name: reporter.rows[0].name,
        role: reporter.rows[0].role
      },
      created_at: issue?.created_at,
      updated_at: issue?.updated_at
    });
  }
  return finalIssue;
};
var getSingleIssuesFromDb = async (id) => {
  const result = await pool.query(`
            SELECT * FROM issues WHERE id=$1
            `, [id]);
  const issue = result.rows[0];
  const reporterId = result.rows[0].reporter_id;
  const reporter = await pool.query(`
            SELECT *FROM users WHERE id=$1
            `, [reporterId]);
  console.log(reporter);
  return {
    id: issue?.id,
    title: issue?.title,
    description: issue?.description,
    type: issue?.type,
    status: issue?.status,
    reporter: {
      id: reporter.rows[0].id,
      name: reporter.rows[0].name,
      role: reporter.rows[0].role
    },
    created_at: issue?.created_at,
    updated_at: issue?.updated_at
  };
};
var updateSingleIssuesFromDb = async (payload, id) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
            UPDATE issues SET title=$1,description=$2,type=$3 WHERE id=$4 RETURNING *
            `,
    [title, description, type, id]
  );
  return result;
};
var deleteSingleIssuesFromDb = async (id) => {
  const result = await pool.query(
    ` DELETE FROM issues  WHERE id=$1 RETURNING * `,
    [id]
  );
  return result;
};
var issuesService = {
  createIssuesIntoDb,
  getAllIssuesFromDb,
  getSingleIssuesFromDb,
  updateSingleIssuesFromDb,
  deleteSingleIssuesFromDb
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  try {
    const currentUser = req?.user;
    const result = await issuesService.createIssuesIntoDb(
      currentUser,
      req.body
    );
    handleRequestResponse(
      res,
      true,
      "issue created successfully",
      result.rows[0],
      200
    );
  } catch (error2) {
    handleResponseError(res, error2);
  }
};
var getAllIssues = async (req, res) => {
  try {
    const { sort, type, status } = req.query;
    const result = await issuesService.getAllIssuesFromDb(
      sort,
      type,
      status
    );
    handleRequestResponse(
      res,
      true,
      "issue get successfully",
      result,
      200
    );
  } catch (error2) {
    handleResponseError(res, error2);
  }
};
var getSingleIssues = async (req, res) => {
  try {
    const id = req?.params?.id;
    console.log("requeste id ", id);
    const result = await issuesService.getSingleIssuesFromDb(id);
    handleRequestResponse(
      res,
      true,
      "issue get successfully",
      result,
      200
    );
  } catch (error2) {
    handleResponseError(res, error2);
  }
};
var updateSingleIssues = async (req, res) => {
  try {
    const id = req?.params?.id;
    const result = await issuesService.updateSingleIssuesFromDb(req.body, id);
    handleRequestResponse(
      res,
      true,
      "issue updated successfully",
      result.rows[0],
      200
    );
  } catch (error2) {
    handleResponseError(res, error2);
  }
};
var deleteSingleIssues = async (req, res) => {
  try {
    const id = req?.params?.id;
    const result = await issuesService.deleteSingleIssuesFromDb(id);
    handleRequestResponse(
      res,
      true,
      "issue deleted successfully",
      null,
      200
    );
  } catch (error2) {
    handleResponseError(res, error2);
  }
};
var issuesController = {
  createIssue,
  getAllIssues,
  getSingleIssues,
  updateSingleIssues,
  deleteSingleIssues
};

// src/middleware/auth.issue.ts
import "express";
import Jwt from "jsonwebtoken";
var createIssueAuth = () => {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access !!"
      });
    }
    const decodedToken = Jwt.verify(
      token,
      config_default.access_token_key
    );
    const existsUser = await pool.query(
      `
        SELECT *FROM users WHERE email=$1
        `,
      [decodedToken?.email]
    );
    const user = existsUser.rows[0];
    if (existsUser.rows.length == 0) {
      res.status(404).json({
        success: false,
        message: "User not found in database !!"
      });
    }
    if (!user?.role.includes("contributor") && !user?.role.includes("maintainer")) {
      res.status(403).json({
        success: false,
        message: "Forbidden !!"
      });
    }
    req.user = decodedToken;
    next();
  };
};
var updatedIssueAuth = () => {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    const issueId = req.params.id;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access !!"
      });
    }
    const decodedToken = Jwt.verify(
      token,
      config_default.access_token_key
    );
    const existsUser = await pool.query(
      `
        SELECT *FROM users WHERE email=$1
        `,
      [decodedToken?.email]
    );
    if (existsUser.rows.length == 0) {
      return res.status(404).json({
        success: false,
        message: "User not found in database !!"
      });
    }
    const currentUser = existsUser.rows[0];
    const currentUserId = currentUser.id;
    const currentUserRole = currentUser.role;
    const currentUserIssue = await pool.query(
      `
  SELECT *FROM issues WHERE id=$1
  `,
      [issueId]
    );
    if (!currentUserIssue.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Issues not found"
      });
    }
    if (currentUserRole == "maintainer") {
      return next();
    }
    {
      if (currentUserIssue.rows[0].reporter_id !== currentUserId && currentUserIssue.rows[0].status == "open") {
        return res.status(404).json({
          message: "this is not your issues"
        });
      }
      if (currentUserRole == "contributor") {
        if (currentUserIssue.rows[0].reporter_id == currentUserId && currentUserIssue.rows[0].status == "open") {
          return next();
        }
      }
      return res.status(403).json({
        success: false,
        message: "forbidden"
      });
    }
  };
};
var deleteIssueAuth = () => {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    const issueId = req.params.id;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access !!"
      });
    }
    const decodedToken = Jwt.verify(
      token,
      config_default.access_token_key
    );
    const existsUser = await pool.query(
      `
        SELECT *FROM users WHERE email=$1
        `,
      [decodedToken?.email]
    );
    if (existsUser.rows.length == 0) {
      return res.status(404).json({
        success: false,
        message: "User not found in database !!"
      });
    }
    const currentUser = existsUser.rows[0];
    const currentUserRole = currentUser.role;
    const currentUserIssue = await pool.query(
      `
  SELECT *FROM issues WHERE id=$1
  `,
      [issueId]
    );
    if (!currentUserIssue.rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Issues not found"
      });
    }
    if (currentUserRole != "maintainer") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access !!"
      });
    }
    if (currentUserRole == "maintainer") {
      return next();
    }
  };
};

// src/modules/issues/issues.router.ts
var router2 = Router2();
router2.post("/", createIssueAuth(), issuesController.createIssue);
router2.get("/", issuesController.getAllIssues);
router2.get("/:id", issuesController.getSingleIssues);
router2.patch("/:id", updatedIssueAuth(), issuesController.updateSingleIssues);
router2.delete("/:id", deleteIssueAuth(), issuesController.deleteSingleIssues);
var issuesRouter = router2;

// src/app/app.ts
import cors from "cors";
var app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000"
  })
);
app.use("/api/auth", userRouter);
app.use("/api/issues", issuesRouter);
app.get("/", (req, res) => {
  res.send("this is the DevPulse server");
});
app.use(error_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDb();
  app_default.listen(config_default.port, () => {
    console.log(`the server is running on port :${config_default.port}`);
  });
};
main();
export {
  main
};
//# sourceMappingURL=server.mjs.map