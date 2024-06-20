import React from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { ICheet } from "../utils/interfaces";
import { useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";

interface Props {
	isLoading: boolean;
	isDisabled: boolean;
	setLoading: (arg: boolean) => void;
	setCheets: (arg: ICheet[]) => void;
	setErrors: (arg: string[]) => void;
}

const SubmitCheet: React.FC<Props> = ({ isLoading, isDisabled, setLoading, setCheets, setErrors }) => {
	const { id } = useParams();
	const { register, handleSubmit, reset } = useForm<{ text: string }>();
	const onSubmit: SubmitHandler<{ text: string }> = (data) => {
		setLoading(true);
		reset();
		axios
			.post(`${process.env.REACT_APP_SERVER_URL}/${id ? "/users/" + id : ""}/cheets`, data)
			.then((res) => {
				setLoading(false);
				setCheets(res.data);
			})
			.catch((error: unknown) => {
				axios.isAxiosError(error) && (error.response?.status == 400 || 401)
					? setErrors([error.response?.data])
					: setErrors(["Could not send Cheet"]);
				setLoading(false);
			});
	};
	return (
		<div>
			<form onSubmit={handleSubmit(onSubmit)}>
				Send a Cheet: &nbsp;
				<input
					{...register("text")}
					type='text'
				/>{" "}
				&nbsp;
				{isLoading ? <ClipLoader /> :
					<input
						disabled={isDisabled}
						type='submit'
					/>}
			</form>
		</div>
	);
};

export default SubmitCheet;
