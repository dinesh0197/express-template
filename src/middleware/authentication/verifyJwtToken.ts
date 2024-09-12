import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { HttpStatusCodes as CODE } from "../../utils/enums";
import { credentials } from "../../configs/credentials";
import User from "../../schemas/user.schema";

const extractTokenFromHeaders = (req: Request) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

const sendUnauthorizedResponse = (res: Response, message: string) => {
  return res.status(CODE.UNAUTHORIZED).json({
    success: false,
    message,
    data: null,
  });
};

export const authCheck = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jwtToken = extractTokenFromHeaders(req);

      // Check if the token exists
      if (!jwtToken) {
        return sendUnauthorizedResponse(res, "Access token not found");
      }

      const secretKey = credentials.jwtSecretkey;

      // Verify the token
      const decodedToken = jwt.verify(jwtToken, secretKey) as any;

      // Find the user by ID and check if they are active
      const user = await User.findOne({
        _id: decodedToken.id,
        isActive: true,
      });

      if (!user) {
        return sendUnauthorizedResponse(res, "Invalid Access");
      }

      // Attach user info to request object
      req.userInfo = {
        userId: decodedToken.id,
        userName: decodedToken.name,
        userEmail: decodedToken.email,
      };

      next();
    } catch (error) {
      // Handle token verification errors or other exceptions
      if (error instanceof jwt.JsonWebTokenError) {
        return sendUnauthorizedResponse(res, "Invalid Access");
      }

      res.status(CODE.INTERNAL_SERVER).json({
        success: false,
        message: "Internal server error",
        data: null,
      });
    }
  };
};
