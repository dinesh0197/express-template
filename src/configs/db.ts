import mongoose from "mongoose";
import { credentials } from "./credentials";

const uri = credentials.dbURI;
const mongooseOptions = {
  serverSelectionTimeoutMS: 50000,
};

if (!uri) {
  console.log("cannot connect to database, db credential's missing");
  process.exit(1);
}

export const DbInstance = mongoose.connect(uri, mongooseOptions);
