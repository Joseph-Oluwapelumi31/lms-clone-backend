import { Request, Response, NextFunction } from "express";


import  {AppError} from '../utils/AppError.js'

function errorHandler(err: any , req: Request, res: Response, next: NextFunction) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  const message =
    err instanceof AppError
      ? err.message
      : process.env.NODE_ENV === "production"
      ? "Something went wrong"
      : err.message || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    message,
  });
}

export default errorHandler;


