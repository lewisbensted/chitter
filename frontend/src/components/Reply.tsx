import React, { useState } from "react";
import { IReply } from "../utils/interfaces";
import { format } from "date-fns";
import axios from "axios";
import { Link } from "react-router-dom";
import EditReply from "./EditReply";
import { serverURL } from "../utils/serverURL";
import { ClipLoader } from "react-spinners";

interface Props {
    userId?: number;
    cheetId: number;
    reply: IReply;
    setError: (arg: string) => void;
    setReplies: (arg: IReply[]) => void;
    isLoading: boolean;
    setLoading: (arg: boolean) => void;
}

const Reply: React.FC<Props> = ({ userId, cheetId, reply, setReplies, setError, isLoading, setLoading }) => {
    const [isReplyLoading, setReplyLoading] = useState<boolean>(false);

    return (
        <div>
            <Link to={`/users/${reply.userId}`}>{reply.username}</Link> &nbsp;
            <EditReply
                cheetId={cheetId}
                reply={reply}
                isDisabled={isLoading}
                setLoading={setLoading}
                setReplies={setReplies}
                setError={setError}
                userId={userId}
            />
            <span>{format(reply.createdAt, "hh:mm dd/MM/yy")}&nbsp;</span>
            {userId === reply.userId ? (
                isReplyLoading ? (
                    <ClipLoader />
                ) : (
                    <button
                        disabled={isLoading}
                        onClick={async () => {
                            setReplyLoading(true);
                            setLoading(true);
                            await axios
                                .delete(`${serverURL}/cheets/${reply.cheetId}/replies/${reply.id}`, {
                                    withCredentials: true,
                                })
                                .then((res: { data: IReply[] }) => {
                                    setReplies(res.data);
                                })
                                .catch((error: unknown) => {
                                    console.log(error);
                                    axios.isAxiosError(error) && [401, 403].includes(error.response?.status!)
                                        ? setError(error.response?.data)
                                        : setError("An unexpected error occured while deleting reply.");
                                });
                            setReplyLoading(false);
                            setLoading(false);
                        }}
                    >
                        DELETE
                    </button>
                )
            ) : null}
        </div>
    );
};

export default Reply;
