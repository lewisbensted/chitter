import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ICheet, IUser } from "../utils/interfaces";
import Layout from "./Layout";
import { ClipLoader } from "react-spinners";
import ErrorModal from "../components/ErrorModal";
import Cheet from "../components/Cheet";
import SubmitCheet from "../components/SubmitCheet";

const User: React.FC = () => {
	const [isPageLoading, setPageLoading] = useState<boolean>(true);
	const [isFormLoading, setFormLoading] = useState<boolean>(false);
	const [username, setUsername] = useState<string>("");
	const [userId, setUserId] = useState<number | undefined>(undefined);
	const [cheets, setCheets] = useState<ICheet[]>([]);
	const [errors, setErrors] = useState<string[]>([]);
	const [cheetsError, setCheetsError] = useState<string>("");
	const { id } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		axios
			.get("/validate")
			.then((res: { data: IUser }) => {
				setUserId(res.data.id);
			})
			.catch((error: unknown) => {
				if (axios.isAxiosError(error) && error.response?.status == 401) {
					navigate("/");
				}
			});
	}, []);

	useEffect(() => {
		if (userId) {
			axios
				.post(`/users/${id}`)
				.then((res: { data: string }) => {
					setUsername(res.data);
				})
				.catch(() => {
					navigate("/");
				});
		}
	}, [userId]);

	useEffect(() => {
		if (userId && username) {
			axios
				.get(`/users/${id}/cheets`)
				.then((res: { data: ICheet[] }) => {
					setCheets(res.data);
					setPageLoading(false);
				})
				.catch(() => {
					setCheetsError("Could not load cheets");
					setPageLoading(false);
				});
		}
	}, [userId, username]);

	return (
		<Layout
			isLoading={isPageLoading || isFormLoading}
			setLoading={setPageLoading}
			setCheets={setCheets}
			userId={userId}
			setUserId={setUserId}>
			{username ? (
				<div>
					<h1>{username}</h1>
					{isPageLoading ? (
						<ClipLoader />
					) : (
						<div>
							<ErrorModal
								errors={errors}
								closeModal={() => setErrors([])}
							/>
							{cheetsError
								? cheetsError
								: cheets.map((cheet, key) => (
									<Cheet
										isDisabled={isFormLoading}
										cheet={cheet}
										userId={userId}
										setCheets={setCheets}
										setLoading={setPageLoading}
										setErrors={setErrors}
										key={key}
									/>
								))}
						</div>
					)}
					{userId === Number(id) ? (
						<SubmitCheet
							isLoading={isFormLoading}
							isDisabled={isPageLoading}
							setLoading={setFormLoading}
							setCheets={setCheets}
							setErrors={setErrors}
						/>
					) : null}
				</div>
			) : (
				<ClipLoader />
			)}
		</Layout>
	);
};

export default User;
