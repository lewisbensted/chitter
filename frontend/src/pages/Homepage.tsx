import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { ICheet, IUser } from "../utils/interfaces";
import { ClipLoader } from "react-spinners";
import SubmitCheet from "../components/SubmitCheet";
import Cheet from "../components/Cheet";
import ErrorModal from "../components/ErrorModal";

const Homepage: React.FC = () => {
	const [isPageLoading, setPageLoading] = useState<boolean>(true);
	const [isFormLoading, setFormLoading] = useState<boolean>(false);
	const [userId, setUserId] = useState<number | undefined>(undefined);
	const [cheets, setCheets] = useState<ICheet[]>([]);
	const [errors, setErrors] = useState<string[]>([]);
	const [cheetsError, setCheetsError] = useState<string>("");

	useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_SERVER_URL}/validate`)
			.then((res: { data: IUser }) => {
				setUserId(res.data.id);
			})
			.catch((error: unknown) => {
				if (axios.isAxiosError(error) && error.response?.status == 401) {
					setUserId(undefined);
					setPageLoading(false);
				}
			});
	}, []);

	useEffect(() => {
		if (userId) {
			axios
				.get("/cheets")
				.then((res: { data: ICheet[] }) => {
					setCheets(res.data);
					setPageLoading(false);
				})
				.catch(() => {
					setCheetsError("Could not load Cheets");
					setPageLoading(false);
				});
		}
	}, [userId]);

	return (
		<Layout
			isLoading={isPageLoading || isFormLoading}
			setLoading={setPageLoading}
			setCheets={setCheets}
			userId={userId}
			setUserId={setUserId}>
			<div>
				<h1>Welcome to Chitter</h1>
				<div>
					{userId ? (
						<div>
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
												isDisabled = {isFormLoading}
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
							<SubmitCheet
								isLoading={isFormLoading}
								isDisabled={isPageLoading}
								setLoading={setFormLoading}
								setCheets={setCheets}
								setErrors={setErrors}
							/>
						</div>
					) : null}
				</div>
			</div>
		</Layout>
	);
};

export default Homepage;
