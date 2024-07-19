import React, { useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { IReply } from "../utils/interfaces";
import { ClipLoader } from "react-spinners";
import { serverURL } from "../utils/serverURL";

interface Props {
    cheetId: number;
    isDisabled: boolean;
    setReplies: (arg: IReply[]) => void;
    setError: (arg: string) => void;
    setPageLoading: (arg: boolean) => void;
}

const SubmitReply: React.FC<Props> = ({ cheetId, isDisabled, setReplies, setError, setPageLoading }) => {
    const { register, handleSubmit, reset } = useForm<{ text: string }>();
    const [isLoading, setLoading] = useState<boolean>();

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setLoading(true);
        setPageLoading(true);
        reset();
        await axios
            .post(`${serverURL}/cheets/${cheetId}/replies`, data, {
                withCredentials: true,
            })
            .then((res) => {
                setReplies(res.data);
            })
            .catch((error: unknown) => {
                axios.isAxiosError(error) && [400, 401].includes(error.response?.status!)
                    ? setError(error.response?.data)
                    : setError("An unexpected error occured while sending reply.");
            });
        setLoading(false);
        setPageLoading(false);
    };
    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                Send a Reply: &nbsp;
                <input {...register("text")} type="text" /> &nbsp;
                {isLoading ? <ClipLoader /> : <input disabled={isDisabled} type="submit" />}
            </form>
        </div>
    );
};

export default SubmitReply;
