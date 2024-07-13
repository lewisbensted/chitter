import axios from "axios";
import React, { useState } from "react";
import { IReply } from "../utils/interfaces";
import { SubmitHandler, useForm } from "react-hook-form";
import { ClipLoader } from "react-spinners";
import { serverURL } from "../utils/serverURL";

interface Props {
    isDisabled: boolean;
    setRepliesLoading: (arg: boolean) => void;
    setReplies: (arg: IReply[]) => void;
    setError: (arg: string) => void;
    reply: IReply;
    repliesLoading: boolean;
    cheetId: number;
}

const EditReply: React.FC<Props> = ({
    reply,
    isDisabled,
    setRepliesLoading,
    setReplies,
    setError,
    repliesLoading,
    cheetId,
}) => {
    const [editing, setEditing] = useState<boolean>(false);
    const { register, handleSubmit } = useForm<{ text: string }>();

    const onSubmit: SubmitHandler<{ text: string }> = (data) => {
        setRepliesLoading(true);
        axios
            .put(`${serverURL}/cheets/${cheetId}/replies/${reply.id}`, data, {
                withCredentials: true,
            })
            .then((res) => {
                setRepliesLoading(false);
                setReplies(res.data);
            })
            .catch((error: unknown) => {
                axios.isAxiosError(error) && [400, 401, 403, 404].includes(error.response?.status!)
                    ? setError(error.response?.data)
                    : setError("An unexpected error occured while editing reply.");
                setRepliesLoading(false);
            });
    };

    return (
        <div>
            {editing ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <input {...register("text")} type="text" defaultValue={reply.text} />
                    {repliesLoading ? <ClipLoader /> : <input disabled={isDisabled} type="submit" />}
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
