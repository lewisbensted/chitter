/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { createProxyMiddleware } = require("http-proxy-middleware");

const PORT = process.env.REACT_APP_SERVER_PORT || 4000

const filterLogin = (pathname, req) => {
	return pathname.match("^/login") && req.method == "POST";
};

const filterRegister = (pathname, req) => {
	return pathname.match("^/register") && req.method == "POST";
};

const filterUser = (pathname, req) => {
	return pathname.match("^/users/*") && req.method == "POST";
};

module.exports = function (app) {
	app.use("/users/*", createProxyMiddleware(filterUser, { target: `http://localhost:${PORT}`, changeOrigin: true }));
	app.use("/validate", createProxyMiddleware({ target: `http://localhost:${PORT}`, changeOrigin: true }));
	app.use("/cheets", createProxyMiddleware({ target: `http://localhost:${PORT}`, changeOrigin: true }));
	app.use("/users/*/cheets", createProxyMiddleware({ target: `http://localhost:${PORT}`, changeOrigin: true }));
	app.use("/login", createProxyMiddleware(filterLogin, { target: `http://localhost:${PORT}`, changeOrigin: true }));
	app.use("/cheets/*/replies", createProxyMiddleware({ target: `http://localhost:${PORT}`, changeOrigin: true }));
	app.use("/register", createProxyMiddleware(filterRegister, { target: `http://localhost:${PORT}`, changeOrigin: true }));
	app.use("/logout", createProxyMiddleware({ target: `http://localhost:${PORT}`, changeOrigin: true }));
};
