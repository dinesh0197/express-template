import "dotenv/config";

let credentialsInstance: Credentials | null = null;

interface Credentials {
  port: number;
  dbURI: string;
  emailHost: string;
  emailPort: number;
  emailAddress: string;
  emailPassword: string;
  jwtSecretkey: string;
  frontendURL: string;
}

const createCredentialsInstance = (): Credentials => ({
  port: Number(process.env.PORT) || 4000,
  dbURI: process.env.DB_URI || "mongodb://localhost:27017/prestige-metals",
  emailHost: process.env.EMAIL_HOST || "",
  emailPort: Number(process.env.EMAIL_PORT) || 465,
  emailAddress: process.env.EMAIL_ADDRESS || "",
  emailPassword: process.env.EMAIL_PASSWORD || "",
  jwtSecretkey: process.env.JWT_SECRET_KEY || "",
  frontendURL: process.env.FRONTEND_URL || "",
});

const getCredentials = (): Credentials => {
  if (!credentialsInstance) {
    credentialsInstance = createCredentialsInstance();
  }
  return credentialsInstance;
};

export const credentials = getCredentials();
