import { GenResObj } from "../../utils/responseMapper";
import { HttpStatusCodes as Code } from "../../utils/enums";
import path from "path";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { SendMail } from "../../helper/sendmail";
import User from "../../schemas/user.schema";
import { createToken } from "../../middleware/authentication/createToken";
import { credentials } from "../../configs/credentials";

export const generateOtpDetails = () => {
  const otp = Math.floor(Math.random() * 900000) + 100000;
  const otpExpiryTime = new Date(Date.now() + 10 * 60 * 1000);
  return { otp, otpExpiryTime };
};

export const handleExistingUser = async (existingUser: any) => {
  if (existingUser.isActive) {
    return GenResObj(
      Code.BAD_REQUEST,
      false,
      "Email already exists. Please use the login option to continue."
    );
  }

  const currentTime = new Date();
  if (existingUser.otpExpiryTime && currentTime < existingUser.otpExpiryTime) {
    return GenResObj(
      Code.CREATED,
      false,
      "Please check your email for the OTP or try again after 10 minutes to generate a new one."
    );
  }

  await User.deleteOne({ _id: existingUser._id });
  return null;
};

export const sendEmailAndCreateUser = async (
  email: string,
  name: string,
  password: string,
  otp: number,
  otpExpiryTime: Date
) => {
  const mailSubject = "PRESTIGE METALS - Activate Account";
  const mailObj = { otp, name };
  const templatePath = path.resolve(
    __dirname,
    "../../",
    "views",
    "register.template.ejs"
  );

  await SendMail(templatePath, mailSubject, email, mailObj);
  await User.create({ email, name, password, otp, otpExpiryTime });
  return GenResObj(Code.CREATED, true, "Please check your email for the OTP");
};

export const handleLoginSuccess = (user: any) => {
  const token = createToken(user._id, user.name, user.email);
  return GenResObj(Code.OK, true, "Login successful", { ...user, token });
};

export const handleInvalidOtp = (message: string) => {
  return GenResObj(Code.BAD_REQUEST, false, message);
};

export const handleVerificationSuccess = (user: any) => {
  const token = createToken(user._id, user.name, user.email);
  const userData = {
    name: user.name,
    email: user.email,
    _id: user._id,
    token,
  };
  return GenResObj(Code.OK, true, "OTP verification successful", userData);
};

export const resendOtpEmail = async (
  email: string,
  otp: number,
  name: string
) => {
  const mailSubject = "PRESTIGE METALS - Verify OTP";
  const mailObj = { otp, name };
  const templatePath = path.resolve(
    __dirname,
    "../../",
    "views",
    "register.template.ejs"
  );
  return SendMail(templatePath, mailSubject, email, mailObj);
};

export const validatePassword = async (
  password: string,
  hashedPassword: string
) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

export const updateForgotPasswordCode = async (email: string) => {
  const forgotPasswordCode = crypto.randomUUID();
  return await User.findOneAndUpdate(
    { email },
    { forgotPassword: forgotPasswordCode, setFrgtPswd: true },
    { new: true }
  ).lean();
};

export const sendResetPasswordEmail = async (user: any, email: string) => {
  const mailSubject = "PRESTIGE METALS - Reset Password";
  const mailObj = {
    frontendURL: credentials.frontendURL,
    id: user._id,
    name: user.name,
    forgotPasswordCode: user.forgotPassword,
  };
  const templatePath = path.resolve(
    __dirname,
    "../../",
    "views",
    "forgotpassword.template.ejs"
  );

  await SendMail(templatePath, mailSubject, email, mailObj);
};
