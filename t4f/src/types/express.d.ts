import { AuthenticatedUser } from "../domain/auth/AuthenticatedUser";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
