import type { NextFunction, Request, Response } from "express";


// Global Error Handling Middleware
const error=((err:any, req:Request, res:Response, next:NextFunction) => {
  console.error(err.stack); // Log the error

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default error
