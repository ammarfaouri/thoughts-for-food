import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "../../../shared/AppError";

export function validateQuery(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(400, error.errors[0]?.message ?? "Invalid query", "VALIDATION_ERROR");
      }
      next(error);
    }
  };
}
