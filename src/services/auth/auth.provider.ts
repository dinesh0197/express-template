import { Request } from "express";
import User from "../../schemas/user.schema";
import { GenResObj } from "../../utils/responseMapper";
import { HttpStatusCodes as Code } from "../../utils/enums";
import {
  validateForgotPassword,
  validateLogin,
  validateOtp,
  validateRegister,
  validateResendOtp,
  validateSetPassword,
  validateUpdatePassword,
} from "./auth.validate";
import {
  generateOtpDetails,
  handleExistingUser,
  handleInvalidOtp,
  handleLoginSuccess,
  handleVerificationSuccess,
  hashPassword,
  resendOtpEmail,
  sendEmailAndCreateUser,
  sendResetPasswordEmail,
  updateForgotPasswordCode,
  validatePassword,
} from "./auth.helper";
import { createToken } from "../../middleware/authentication/createToken";

export const register = async (req: Request) => {
  try {
    const { error } = validateRegister(req.body);
    if (error) {
      return GenResObj(Code.BAD_REQUEST, false, error.details[0].message);
    }

    const { email, name, password } = req.body;

    const existingUser = await User.findOne({ email });
    const { otp, otpExpiryTime } = generateOtpDetails();

    if (existingUser) {
      const response = await handleExistingUser(existingUser);
      if (response) return response;
    }

    return await sendEmailAndCreateUser(
      email,
      name,
      password,
      otp,
      otpExpiryTime
    );
  } catch (err) {
    return GenResObj(Code.INTERNAL_SERVER, false, (err as Error).message);
  }
};

export const login = async (req: Request) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return GenResObj(Code.BAD_REQUEST, false, error.details[0].message);
    }

    const { email, password } = req.body;
    const user: any = await User.findOne({ email }).lean();

    if (!user) {
      return GenResObj(
        Code.BAD_REQUEST,
        false,
        "User not exists for this email"
      );
    }

    if (!user.isActive) {
      return GenResObj(Code.UNAUTHORIZED, false, "User is not active");
    }

    const passwordMatches = await validatePassword(
      password,
      user.password || ""
    );

    if (passwordMatches) {
      // Clean sensitive data and create success response
      delete user.password;
      delete user.otp;
      delete user.otpExpiryTime;
      delete user.setFrgtPswd;
      delete user.__v;

      return handleLoginSuccess(user);
    } else {
      return GenResObj(Code.BAD_REQUEST, false, "Password not matched");
    }
  } catch (err) {
    return GenResObj(Code.INTERNAL_SERVER, false, (err as Error).message);
  }
};

export const verifyOtp = async (req: Request) => {
  try {
    const { error } = validateOtp(req.body);
    if (error) {
      return GenResObj(Code.BAD_REQUEST, false, error.details[0].message);
    }

    const { email, otp } = req.body;
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return GenResObj(Code.NOT_FOUND, false, "User data not found");
    }

    if (user.isActive) {
      return GenResObj(Code.BAD_REQUEST, false, "Account is already verified");
    }

    // Check if OTP is expired
    const currentTime = new Date();
    if (!(user.otpExpiryTime && currentTime < user.otpExpiryTime)) {
      return handleInvalidOtp("OTP expired");
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return handleInvalidOtp("OTP doesn't match");
    }

    // Update user status to active
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { isActive: true },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return GenResObj(Code.NOT_FOUND, false, "User data not found");
    }

    return handleVerificationSuccess(updatedUser);
  } catch (err) {
    console.log(err);
    return GenResObj(Code.INTERNAL_SERVER, false, (err as Error).message);
  }
};

export const resendOtp = async (req: Request) => {
  try {
    const { error } = validateResendOtp(req.body);
    if (error)
      return GenResObj(Code.BAD_REQUEST, false, error.details[0].message);

    const { email } = req.body;

    const { otp, otpExpiryTime } = generateOtpDetails();

    // Update user with new OTP
    const user = await User.findOneAndUpdate(
      { email, isActive: false },
      { otp, otpExpiryTime },
      { new: true }
    );

    if (!user) return GenResObj(Code.NOT_FOUND, false, "Email not found");

    // resend OTP email
    await resendOtpEmail(email, otp, user.name || "anonymous");

    return GenResObj(Code.CREATED, true, "OTP sent successfully");
  } catch (err) {
    console.error(err);
    return GenResObj(Code.INTERNAL_SERVER, false, (err as Error).message);
  }
};

export const updatePassword = async (req: Request) => {
  try {
    const { error } = validateUpdatePassword(req.body);
    if (error)
      return GenResObj(Code.BAD_REQUEST, false, error.details[0].message);

    const { oldPassword, newPassword } = req.body;
    const { userId } = req.userInfo;

    const user = await User.findById(userId);
    if (!user) return GenResObj(Code.UNAUTHORIZED, false, "User not found");

    const isOldPasswordValid = await validatePassword(
      oldPassword,
      user.password || ""
    );

    if (!isOldPasswordValid)
      return GenResObj(Code.UNAUTHORIZED, false, "Old password not matched");

    user.password = await hashPassword(newPassword);
    await user.save({ validateBeforeSave: true });

    return GenResObj(Code.OK, true, "Password updated successfully");
  } catch (err) {
    console.error(err);
    return GenResObj(Code.INTERNAL_SERVER, false, (err as Error).message);
  }
};

export const forgotPassword = async (req: Request) => {
  try {
    const { email } = req.body;

    const { error } = validateForgotPassword(req.body);
    if (error)
      return GenResObj(Code.BAD_REQUEST, false, error.details[0].message);

    const user = await User.findOne({ email }).lean();

    if (!user)
      return GenResObj(Code.BAD_REQUEST, false, "Invalid email address");

    // Generate and update the user's forgot password code
    const updatedUser = await updateForgotPasswordCode(email);
    if (!updatedUser)
      return GenResObj(Code.INTERNAL_SERVER, false, "Failed to update user");

    // Send the reset password email
    await sendResetPasswordEmail(updatedUser, email);

    return GenResObj(Code.OK, true, "Email sent successfully");
  } catch (err) {
    console.error(err);
    return GenResObj(Code.INTERNAL_SERVER, false, (err as Error).message);
  }
};

export const setPassword = async (req: Request) => {
  try {
    const { error } = validateSetPassword(req.body);
    if (error)
      return GenResObj(Code.BAD_REQUEST, false, error.details[0].message);

    const { password, id, code } = req.body;

    const user = await User.findOne({ _id: id, forgotPassword: code });

    if (!user) return GenResObj(Code.NOT_FOUND, false, "User not found");

    // Check if the password reset is allowed
    if (user.setFrgtPswd === false)
      return GenResObj(Code.UNAUTHORIZED, false, "Password cannot be reset");

    // Update user password and save
    user.password = password;
    user.setFrgtPswd = false;
    await user.save({ validateBeforeSave: true });

    const token = createToken(
      user._id.toString(),
      user.name || "",
      user.email || ""
    );

    return GenResObj(Code.OK, true, "Password set successfully", {
      ...user,
      token,
    });
  } catch (err) {
    return GenResObj(Code.INTERNAL_SERVER, false, (err as Error).message);
  }
};
