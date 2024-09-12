import { Request, Response } from "express";
import * as AuthProvider from "./auth.provider";
import { TResponse } from "../../utils/commonInterface";

export const authController = {
  signup: async (req: Request, res: Response) => {
    const { code, data }: TResponse = await AuthProvider.register(req);
    res.status(code).json(data);
    return;
  },

  signin: async (req: Request, res: Response) => {
    const { code, data }: TResponse = await AuthProvider.login(req);
    res.status(code).json(data);
    return;
  },

  verifyOtp: async (req: Request, res: Response) => {
    const { code, data }: TResponse = await AuthProvider.verifyOtp(req);
    res.status(code).json(data);
    return;
  },

  resendOtp: async (req: Request, res: Response) => {
    const { code, data }: TResponse = await AuthProvider.resendOtp(req);
    res.status(code).json(data);
    return;
  },

  updatePassword: async (req: Request, res: Response) => {
    const { code, data }: TResponse = await AuthProvider.updatePassword(req);
    res.status(code).json(data);
    return;
  },

  forgotPassword: async (req: Request, res: Response) => {
    const { code, data }: TResponse = await AuthProvider.forgotPassword(req);
    res.status(code).json(data);
    return;
  },

  setPassword: async (req: Request, res: Response) => {
    const { code, data }: TResponse = await AuthProvider.setPassword(req);
    res.status(code).json(data);
    return;
  },
};
