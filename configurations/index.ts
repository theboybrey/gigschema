"use strict";

interface Configuration {
  [key: string]: Record<string, any>;
}

export const configurations: Configuration = {
  title: {
    default: "Gigschema",
    auth: {
      login: "Login",
      register: "Register",
      forgotPassword: "Forgot Password",
      resetPassword: "Reset Password",
      verifyEmail: "Verify Email",
      changePassword: "Change Password",
    },
  },
  socket: {
    url:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3017/api"
        : "https://z720-2pkc.onrender.com/api",
    timeout: 5000,
    public: true,
    headers: {
      contentType: "application/json",
      accept: "application/json",
    },
  },
};

export function GetConfiguration<T>(path: string): T | undefined {
  const keys = path.split(".");
  let value = configurations;
  for (const key of keys) {
    if (value && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }
  return value as T;
}
