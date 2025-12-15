import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.resolve(__dirname, `./.env.${process.env.NODE_ENV ?? "development"}`);
const dotEnvResult = dotenv.config({ path: envPath });
dotenvExpand.expand(dotEnvResult);

export const ENVIRONMENT = process.env.NODE_ENV;
export const FRONTEND_PORT = process.env.FRONTEND_PORT ? Number(process.env.FRONTEND_PORT) : 5173;
export const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 3000;
export const PROJECT_ROOT = path.resolve(__dirname, "../..");
export const DATABASE_URL = process.env.DATABASE_URL;
export const TEST_TYPE = process.env.TEST_TYPE;

const checkValidPort = (port: number, side: string) => {
	if (Number.isNaN(port) || port < 0 || port > 65535) {
		throw new TypeError(`Invalid ${side} port provided - must be a number between 0 and 65535.`);
	}
};

export const validateConfig = () => {
	if (dotEnvResult.error) throw new Error(`Failed to load .env file at ${envPath}:\n ${dotEnvResult.error.message}`);
	if (!ENVIRONMENT || !["development", "test", "production"].includes(ENVIRONMENT))
		throw new TypeError("Invalid NODE_ENV provide - must be development, test or production");
	checkValidPort(SERVER_PORT, "server");
	if (ENVIRONMENT !== "production") checkValidPort(FRONTEND_PORT, "frontend");
	if (!DATABASE_URL) throw new TypeError("DATABASE_URL not provided.");
};
