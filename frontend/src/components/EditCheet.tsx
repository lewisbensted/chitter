import axios from "axios";
import React, { useState } from "react";
import { ICheet } from "../utils/interfaces";
import { SubmitHandler, useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import { serverURL } from "../utils/serverURL";

interface Props {
    cheet: ICheet;
    isDisabled: boolean;
    setPageLoading: (arg: boolean) => void;
    setCheets: (arg: ICheet[]) => void;
    setError: (arg: string) => void;
}

const EditCheet: React.FC<Props> = ({ cheet, isDisabled, setPageLoading, setCheets, setError }) => {
    const { id } = useParams();
    const { register, handleSubmit } = useForm<{ text: string }>();
    const [isEditing, setEditing] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>();

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setLoading(true);
        setPageLoading(true);
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
        setPageLoading(false);
    };
    return (
        <div>
            {isEditing ? (
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
