import { execSync } from "child_process";
import { logError } from "../../src/utils/logError";
import { DATABASE_URL } from "../../../config";


export function createTestDatabase(dbName: string) {
	const dbUrl = new URL(DATABASE_URL!);

	const testDbUrl = `mysql://${dbUrl.username}:${dbUrl.password}@${dbUrl.hostname}:${dbUrl.port}/${dbName}`;

	try {
		execSync(
			`mysql -u ${dbUrl.username} -p${dbUrl.password} -h ${dbUrl.hostname} -P ${dbUrl.port} -e "DROP DATABASE IF EXISTS \`${dbName}\`;"`,
			{
				stdio: "inherit",
			}
		);
		execSync(
			`mysql -u ${dbUrl.username} -p${dbUrl.password} -h ${dbUrl.hostname} -P ${dbUrl.port} -e "CREATE DATABASE \`${dbName}\`;"`,
			{
				stdio: "inherit",
			}
		);
	} catch (error) {
		console.error("Error creating test database:");
		logError(error);
	}

	return testDbUrl;
}
