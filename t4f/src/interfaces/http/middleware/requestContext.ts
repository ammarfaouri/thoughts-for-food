import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";

const requestIdHeader = "x-request-id";

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const incomingRequestId = req.header(requestIdHeader);
  const requestId = incomingRequestId?.trim() || randomUUID();

  req.requestId = requestId;
  res.setHeader(requestIdHeader, requestId);

  next();
}
