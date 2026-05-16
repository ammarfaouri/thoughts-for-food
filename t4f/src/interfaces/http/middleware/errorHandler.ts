import { NextFunction, Request, Response } from "express";
import { env } from "../../../config/env";
import { AppError } from "../../../shared/AppError";

type RequestLogger = {
  warn: (input: object, message?: string) => void;
  error: (input: object, message?: string) => void;
};

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    reqLogger(req)?.warn(
      {
        requestId: req.requestId,
        code: error.code,
        statusCode: error.statusCode,
      },
      error.message,
    );

    return res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      requestId: req.requestId,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  reqLogger(req)?.error(
    {
      err: error,
      requestId: req.requestId,
    },
    "Unhandled request error",
  );

  return res.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "Server cannot handle your request at the moment",
    requestId: req.requestId,
    ...(env.NODE_ENV === "development" && error instanceof Error
      ? { details: [{ message: error.message }] }
      : {}),
  });
}

function reqLogger(req: Request) {
  return (req as Request & { log?: RequestLogger }).log;
}
