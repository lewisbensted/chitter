import React, { useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { ICheet } from "../utils/interfaces";
import { useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { serverURL } from "../utils/serverURL";

interface Props {
    isDisabled: boolean;
    setCheets: (arg: ICheet[]) => void;
    setError: (arg: string) => void;
    setPageLoading: (arg: boolean) => void;
}

const SubmitCheet: React.FC<Props> = ({ isDisabled, setCheets, setError, setPageLoading }) => {
    const { id } = useParams();
    const { register, handleSubmit, reset } = useForm<{ text: string }>();
    const [isLoading, setLoading] = useState<boolean>();

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setLoading(true);
        setPageLoading(true);
        reset();
        await axios
            .post(`${serverURL + (id ? `/users/${id}/` : "/")}cheets`, data, {
                withCredentials: true,
            })
            .then((res) => {
                setCheets(res.data.cheets);
            })
            .catch((error: unknown) => {
                axios.isAxiosError(error) && [400, 401].includes(error.response?.status!)
                    ? setError(error.response?.data)
                    : setError("An unexpected error occured while sending cheet.");
            });
        setLoading(false);
        setPageLoading(false);
    };
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                Send a Cheet: &nbsp;
                <input {...register("text")} type="text" /> &nbsp;
                {isLoading ? <ClipLoader /> : <input disabled={isDisabled} type="submit" />}
            </form>
        </div>
    );
};

export default SubmitCheet;
