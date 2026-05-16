import { NextFunction, Request, Response } from "express";

type MetricKey = `${string} ${string} ${number}`;

const requestCounts = new Map<MetricKey, number>();
const requestDurationMsTotals = new Map<MetricKey, number>();

export function httpMetrics(req: Request, res: Response, next: NextFunction) {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const route = routeLabel(req);
    const key: MetricKey = `${req.method} ${route} ${res.statusCode}`;

    requestCounts.set(key, (requestCounts.get(key) ?? 0) + 1);
    requestDurationMsTotals.set(
      key,
      (requestDurationMsTotals.get(key) ?? 0) + durationMs,
    );
  });

  next();
}

export function renderHttpMetrics() {
  const lines = [
    "# HELP t4f_http_requests_total Total HTTP requests.",
    "# TYPE t4f_http_requests_total counter",
  ];

  for (const [key, count] of requestCounts.entries()) {
    const labels = labelsFor(key);
    lines.push(`t4f_http_requests_total{${labels}} ${count}`);
  }

  lines.push(
    "# HELP t4f_http_request_duration_ms_total Total HTTP request duration in milliseconds.",
    "# TYPE t4f_http_request_duration_ms_total counter",
  );

  for (const [key, total] of requestDurationMsTotals.entries()) {
    const labels = labelsFor(key);
    lines.push(`t4f_http_request_duration_ms_total{${labels}} ${total.toFixed(3)}`);
  }

  return `${lines.join("\n")}\n`;
}

function routeLabel(req: Request) {
  if (req.route?.path) {
    return `${req.baseUrl}${req.route.path}`;
  }
  return req.path;
}

function labelsFor(key: MetricKey) {
  const [method, route, status] = key.split(" ");
  return `method="${method}",route="${route}",status="${status}"`;
}
