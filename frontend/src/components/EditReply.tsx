import axios from "axios";
import React, { useState } from "react";
import { IReply } from "../utils/interfaces";
import { SubmitHandler, useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import { serverURL } from "../utils/serverURL";

interface Props {
    isDisabled: boolean;
    setPageLoading: (arg: boolean) => void;
    setReplies: (arg: IReply[]) => void;
    setError: (arg: string) => void;
    reply: IReply;
    cheetId: number;
}

const EditReply: React.FC<Props> = ({ reply, cheetId, isDisabled, setPageLoading, setReplies, setError }) => {
    const { register, handleSubmit } = useForm<{ text: string }>();
    const [isEditing, setEditing] = useState<boolean>(false);
    const [isLoading, setLoading] = useState<boolean>(false);

    const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
        setLoading(true);
        setPageLoading(true);
        await axios
            .put(`${serverURL}/cheets/${cheetId}/replies/${reply.id}`, data, {
                withCredentials: true,
            })
            .then((res) => {
                setReplies(res.data);
            })
            .catch((error: unknown) => {
                axios.isAxiosError(error) && [400, 401, 403, 404].includes(error.response?.status!)
                    ? setError(error.response?.data)
                    : setError("An unexpected error occured while editing reply.");
            });

        setLoading(false);
        setPageLoading(false);
        setEditing(false);
    };

    return (
        <div>
            {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input {...register("text")} type="text" defaultValue={reply.text} />
                    {isLoading ? <ClipLoader /> : <input disabled={isDisabled} type="submit" />}
                </form>
            ) : (
                <div>
                    <span>{reply.text}&nbsp;</span>
                    <button onClick={() => setEditing(true)}>EDIT</button>
                </div>
            )}
        </div>
    );
};

export default EditReply;
