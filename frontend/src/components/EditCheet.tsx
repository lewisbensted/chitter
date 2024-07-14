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
    setError: (arg: string) => void;
    cheet: ICheet;
}

const EditCheet: React.FC<Props> = ({ cheet, isLoading, isDisabled, setLoading, setCheets, setError }) => {
    const [editing, setEditing] = useState<boolean>(false);
    const { id } = useParams();
    const { register, handleSubmit } = useForm<{ text: string }>();
    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setLoading(true);
        await axios
            .put(`${serverURL + (id ? `/users/${id}/` : "/")}cheets/${cheet.id}`, data, {
                withCredentials: true,
            })
            .then((res) => {
                setCheets(res.data.cheets);
            })
            .catch((error: unknown) => {
                axios.isAxiosError(error) && [400, 401, 403, 404].includes(error.response?.status!)
                    ? setError(error.response?.data)
                    : setError("An unexpected error occured while editing cheet.");
            });
        setEditing(false);
        setLoading(false);
    };
    return (
        <div>
            {editing ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input {...register("text")} type="text" defaultValue={cheet.text} />
                    {isLoading ? <ClipLoader /> : <input disabled={isDisabled} type="submit" />}
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
