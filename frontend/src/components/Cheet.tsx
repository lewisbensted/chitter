import React, { useState } from "react";
import { ICheet } from "../utils/interfaces";
import axios from "axios";
import { format } from "date-fns";
import CheetModal from "./CheetModal";
import { Link, useParams } from "react-router-dom";

interface Props {
	userId: number | undefined;
	cheet: ICheet;
	isDisabled: boolean
	setErrors: (arg: string[]) => void;
	setLoading: (arg: boolean) => void;
	setCheets: (arg: ICheet[]) => void;
}

const Cheet: React.FC<Props> = ({ userId, cheet, isDisabled, setLoading, setErrors, setCheets }) => {
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const { id } = useParams();

	return (
		<div>
			<CheetModal
				cheet={cheet}
				userId={userId}
				isOpen={modalOpen}
				closeModal={() => {
					setModalOpen(false);
				}}
				setCheets={setCheets}
			/>
			<Link to={`/users/${cheet.userId}`}>{cheet.username}</Link> &nbsp;
			<span>{cheet.text}</span> &nbsp;
			<span>{format(cheet.createdAt, "hh:mm dd/MM/yy")}</span> &nbsp;
			<button onClick={() => setModalOpen(true)}>MORE</button> &nbsp;
			{userId === cheet.userId ? (
				<button
					disabled = {isDisabled}
					onClick={() => {
						setLoading(true);
						axios
							.delete(`${process.env.REACT_APP_SERVER_URL}/${id ? "/users/" + id : ""}/cheets/${cheet.id}`)
							.then((res) => {
								setCheets(res.data);
								setLoading(false);
							})
							.catch((error: unknown) => {
								axios.isAxiosError(error) && (error.response?.status == 401 || 403 || 404)
									? setErrors([error.response?.data])
									: setErrors(["Could not delete Cheet"]);
								setLoading(false);
							});
					}}>
					DELETE
				</button>
			) : null}
		</div>
	);
};

export default Cheet;
