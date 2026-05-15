import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../shared/AppError";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
    });
  }

  console.error(error);
  return res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "Server cannot handle your request at the moment",
  });
}
