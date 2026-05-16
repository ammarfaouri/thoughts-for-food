import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
});

export const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "First Name required"),
  lastName: z.string().trim().min(1, "Last Name required"),
  username: z.string().trim().min(1, "Username required"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
