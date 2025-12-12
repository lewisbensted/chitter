import { execSync } from "child_process";
import { logError } from "../../src/utils/logError";

export function createTestDatabase(dbName: string) {
	const dbUrl = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${dbName}`;

	try {
		execSync(
			`mysql -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} -h ${process.env.DB_HOST} -P ${process.env.DB_PORT} -e "DROP DATABASE IF EXISTS \`${dbName}\`;"`,
			{
				stdio: "inherit",
			}
		);
		execSync(
			`mysql -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} -h ${process.env.DB_HOST} -P ${process.env.DB_PORT} -e "CREATE DATABASE \`${dbName}\`;"`,
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
