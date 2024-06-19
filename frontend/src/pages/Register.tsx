import axios from "axios";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import ErrorModal from "../components/ErrorModal";
import { ClipLoader } from "react-spinners";
import SuccessModal from "../components/SuccessModal";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";

interface RegisterFormFields {
	firstName: string;
	lastName: string;
	username: string;
	password: string;
	email: string;
}

const Register: React.FC = () => {
	const { register, handleSubmit, reset } = useForm<RegisterFormFields>();
	const navigate = useNavigate();

	const [isPageLoading, setPageLoading] = useState<boolean>(true);
	const [isFormLoading, setFormLoading] = useState<boolean>(false);
	const [userId, setUserId] = useState<number | undefined>(undefined);
	const [errors, setErrors] = useState<string[]>([]);
	const [success, setSuccess] = useState<boolean>(false);

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

	const onSubmit: SubmitHandler<RegisterFormFields> = (data) => {
		setFormLoading(true);
		reset();
		axios
			.post("/register", data)
			.then(() => {
				setFormLoading(false);
				setSuccess(true);
			})
			.catch((error: unknown) => {
				axios.isAxiosError(error) && error.response?.status == 400
					? setErrors(error.response.data)
					: setErrors(["Registration failed"]);
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
				<ErrorModal
					errors={errors}
					closeModal={() => setErrors([])}
				/>
				<SuccessModal
					success={success}
					closeModal={() => {
						setSuccess(false);
					}}
				/>
				<h1>Registration Page</h1>
				{isPageLoading ? <ClipLoader /> :
					<form onSubmit={handleSubmit(onSubmit)}>
						First Name:
						<input
							{...register("firstName")}
							type='text'
						/>
						Last Name:
						<input
							{...register("lastName")}
							type='text'
						/>
						Username:
						<input
							{...register("username")}
							type='text'
						/>
						Password:
						<input
							{...register("password")}
							type='text'
						/>
						E-mail:
						<input
							{...register("email")}
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
					</form>}
			</div>
		</Layout>
	);
};

export default Register;
