import { AppError } from "../utils/AppError.js";
import { Request, Response, NextFunction } from "express";


export function authorizeRoles (...roles: string[]){
  return (req: Request, res: Response, next: NextFunction) =>{
    const user = (req as any).user;

    if(!user) {
      return next(new AppError('Not authenticated', 401))

    }
    if(!roles.includes(user.role)){
      return next(new AppError('Not allowed' , 403))
    }
    next();
  };
}