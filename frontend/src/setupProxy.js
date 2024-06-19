/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { createProxyMiddleware } = require("http-proxy-middleware");

const targetURL = `http://localhost:${process.env.SERVER_PORT}`;

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
	app.use(
		"/users/*",
		createProxyMiddleware(filterUser, { target: targetURL, changeOrigin: true })
	);
	app.use(
		"/validate",
		createProxyMiddleware({ target: targetURL, changeOrigin: true })
	);
	app.use(
		"/cheets",
		createProxyMiddleware({ target: targetURL, changeOrigin: true })
	);
	app.use(
		"/users/*/cheets",
		createProxyMiddleware({ target: targetURL, changeOrigin: true })
	);
	app.use(
		"/login",
		createProxyMiddleware(filterLogin, {
			target: targetURL,
			changeOrigin: true,
		})
	);
	app.use(
		"/cheets/*/replies",
		createProxyMiddleware({ target: targetURL, changeOrigin: true })
	);
	app.use(
		"/register",
		createProxyMiddleware(filterRegister, {
			target: targetURL,
			changeOrigin: true,
		})
	);
	app.use(
		"/logout",
		createProxyMiddleware({ target: targetURL, changeOrigin: true })
	);
	app.use(
		"/messages",
		createProxyMiddleware({ target: targetURL, changeOrigin: true })
	);
	app.use(
		"/messages/*",
		createProxyMiddleware({ target: targetURL, changeOrigin: true })
	);
};
