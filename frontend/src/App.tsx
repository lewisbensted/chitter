import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import User from "./pages/User";

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/'>
					<Route
						index
						element={<Homepage />}
					/>
					<Route
						path='login'
						element={<Login />}
					/>
					<Route
						path='register'
						element={<Register />}
					/>
					<Route
						path='users/:id'
						element={<User />}
					/>
					<Route
						path='*'
						element={<Homepage />}
					/>
				</Route>
			</Routes>
		</BrowserRouter>
	);
};

export default App;
