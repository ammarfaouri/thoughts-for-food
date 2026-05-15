export type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passwordHash: string;
};

export type PublicUserProfile = {
  firstName: string;
  lastName: string;
  email: string;
};

export type RegisterUserInput = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
};
