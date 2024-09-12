import jwt from "jsonwebtoken";
import { credentials } from "../../configs/credentials";

export const createToken = (id: string, name: string, email: string) => {
  try {
    // calculate in seconds
    const maxAge = 30 * 24 * 60 * 60; //valid for 30days
    const secretKey = credentials.jwtSecretkey;
    const token = jwt.sign({ id, name, email }, secretKey, {
      expiresIn: maxAge,
    });
    return `Bearer ${token}`;
  } catch (error) {
    throw error;
  }
};
