import waitOn from "wait-on";
import { spawn } from "child_process";
import {SERVER_PORT} from './config.js'

console.log("Waiting for server to start...\n");

waitOn({ resources: [`tcp:${SERVER_PORT}`] }, (err) => {
	if (err) {
		console.error("Error starting server:", err);
		process.exit(1);
	}

	console.log("Starting frontend...");

	const frontend = spawn("npm", ["--prefix", "frontend", "run", "dev"], { stdio: "inherit", shell: true });

	frontend.on("exit", (code) => process.exit(code));
});
