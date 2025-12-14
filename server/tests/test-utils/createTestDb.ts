import { execSync } from "child_process";
import { logError } from "../../src/utils/logError";
import { DB_HOST, DB_PASSWORD, DB_PORT, DB_USER } from "../../../config.js";

export function createTestDatabase(dbName: string) {
	const dbUrl = `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${dbName}`;

	try {
		execSync(
			`mysql -u ${DB_USER} -p${DB_PASSWORD} -h ${DB_HOST} -P ${DB_PORT} -e "DROP DATABASE IF EXISTS \`${dbName}\`;"`,
			{
				stdio: "inherit",
			}
		);
		execSync(
			`mysql -u ${DB_USER} -p${DB_PASSWORD} -h ${DB_HOST} -P ${DB_PORT} -e "CREATE DATABASE \`${dbName}\`;"`,
			{
				stdio: "inherit",
			}
		);
	} catch (error) {
		console.error("Error creating test database:");
		logError(error);
	}

	return dbUrl;
}
