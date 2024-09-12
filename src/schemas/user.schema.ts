import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      min: 8,
      max: 16,
    },
    avatar: {
      type: String,
    },
    otp: {
      type: Number,
    },
    otpExpiryTime: {
      type: Date,
    },
    forgotPassword: {
      type: String,
    },
    setFrgtPswd: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });

// Hash the password before it is beeing saved to the database
userSchema.pre("save", async function (this: any, next: any) {
  // Make sure you don't hash the hash password again
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret.password;
    delete ret.forgotPassword;
    delete ret.otp;
    delete ret.otpExpiryTime;
    delete ret.id;
    delete ret.setFrgtPswd;
  },
});

const collectionName = "user";

const User = model("user", userSchema, collectionName);

export default User;
