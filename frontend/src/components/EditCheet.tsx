import axios from "axios";
import React, { useState } from "react";
import { ICheet } from "../utils/interfaces";
import { SubmitHandler, useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import { serverURL } from "../utils/serverURL";

interface Props {
	isLoading: boolean;
	isDisabled: boolean;
	setLoading: (arg: boolean) => void;
	setCheets: (arg: ICheet[]) => void;
	setErrors: (arg: string[]) => void;
	cheet: ICheet;
}

const EditCheet: React.FC<Props> = ({ cheet, isLoading, isDisabled, setLoading, setCheets, setErrors}) => {
	const [editing, setEditing] = useState<boolean>(false);
	const { id } = useParams();
	const { register, handleSubmit } = useForm<{ text: string }>();
	const onSubmit: SubmitHandler<{ text: string }> = (data) => {
		setLoading(true);
		axios
			.put(`${serverURL}/${id ? "users/" + id : ""}cheets/${cheet.id}`, data)
			.then((res) => {
				setLoading(false);
				setEditing(false);
				setCheets(res.data);
			})
			.catch((error: unknown) => {
				axios.isAxiosError(error) && (error.response?.status == 400 || 401 || 403 || 404)
					? setErrors([error.response?.data])
					: setErrors(["Could not update Cheet"]);
				setEditing(false);
				setLoading(false);
			});
	};
	return (
		<div>
			{editing ? (
				<form onSubmit={handleSubmit(onSubmit)}>
					<input
						{...register("text")}
						type='text'
						defaultValue={cheet.text}
					/>
					{isLoading ? (
						<ClipLoader />
					) : (
						<input
							disabled={isDisabled}
							type='submit'
						/>
					)}
				</form>
			) : (
				<div>
					<span>{cheet.text}</span>
					<button onClick={() => setEditing(true)}>EDIT</button>
				</div>
			)}
		</div>
	);
};

export default EditCheet;
