import axios from "axios";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import ErrorModal from "../components/ErrorModal";
import Layout from "./Layout";

interface LoginFormFields {
	username: string;
	password: string;
}

const Login: React.FC = () => {
	const { register, handleSubmit, reset } = useForm<LoginFormFields>();
	const navigate = useNavigate();

	const [isPageLoading, setPageLoading] = useState<boolean>(true);
	const [isFormLoading, setFormLoading] = useState<boolean>(false);
	const [userId, setUserId] = useState<number | undefined>(undefined);
	const [errors, setErrors] = useState<string[]>([]);

	useEffect(() => {
		axios
			.get("/validate")
			.then(() => {
				navigate("/");
			})
			.catch((error: unknown) => {
				if (axios.isAxiosError(error) && error.response?.status == 401) {
					setUserId(undefined);
				}
				setPageLoading(false);
			});
	}, []);

	const onSubmit: SubmitHandler<LoginFormFields> = (data) => {
		setFormLoading(true);
		reset();
		axios
			.post(`${process.env.REACT_APP_SERVER_URL}/login`, data)
			.then(() => {
				navigate("/");
			})
			.catch((error: unknown) => {
				axios.isAxiosError(error) && (error.response?.status == 401 || 403 || 404)
					? setErrors([error.response?.data])
					: setErrors(["Could not log in"]);
				setFormLoading(false);
			});
	};

	return (
		<Layout
			isLoading={isPageLoading || isFormLoading}
			setLoading={setPageLoading}
			setCheets={() => {}}
			userId={userId}
			setUserId={setUserId}>
			<div>
				<h1>Login Page</h1>
				{isPageLoading ? (
					<ClipLoader />
				) : (
					<div>
						<ErrorModal
							errors={errors}
							closeModal={() => setErrors([])}
						/>
						<form onSubmit={handleSubmit(onSubmit)}>
							Username:
							<input
								{...register("username")}
								type='text'
							/>
							{"\n"}
							Password:
							<input
								{...register("password")}
								type='text'
							/>
							{isFormLoading ? (
								<ClipLoader />
							) : (
								<input
									type='submit'
									disabled={userId != undefined}
								/>
							)}
						</form>
					</div>
				)}
			</div>
		</Layout>
	);
};

export default Login;
