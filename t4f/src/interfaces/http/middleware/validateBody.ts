import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AppError } from "../../../shared/AppError";

export function validateBody(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(
          400,
          error.errors[0]?.message ?? "Invalid request",
          "VALIDATION_ERROR",
          error.errors.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        );
      }
      next(error);
    }
  };
}
