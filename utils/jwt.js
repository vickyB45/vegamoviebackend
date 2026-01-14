import jwt from "jsonwebtoken";

export const signAdminToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export const verifyAdminToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
