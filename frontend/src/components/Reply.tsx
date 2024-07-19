import React, { useState } from "react";
import { IReply } from "../utils/interfaces";
import { format } from "date-fns";
import axios from "axios";
import { Link } from "react-router-dom";

import EditReply from "./EditReply";
import { serverURL } from "../utils/serverURL";

interface Props {
    userId: number | undefined;
    cheetId: number;
    reply: IReply;
    setError: (arg: string) => void;
    setReplies: (arg: IReply[]) => void;
    isPageLoading: boolean;
    setPageLoading: (arg: boolean) => void;
}

const Reply: React.FC<Props> = ({
    userId,
    cheetId,
    reply,
    setReplies,
    setError,
    isPageLoading,
    setPageLoading,
}) => {
    const [isLoading, setLoading] = useState<boolean>(false);
    return (
        <div>
            <Link to={`/users/${reply.userId}`}>{reply.username}</Link> &nbsp;
            {userId === reply.userId ? (
                <EditReply
                    cheetId={cheetId}
                    reply={reply}
                    isDisabled={isPageLoading}
                    setPageLoading={setPageLoading}
                    setReplies={setReplies}
                    setError={setError}
                />
            ) : (
                <span>{reply.text}&nbsp;</span>
            )}
            <span>{format(reply.createdAt, "hh:mm dd/MM/yy")}</span>&nbsp;
            {userId === reply.userId ? (
                <button
                    disabled={isPageLoading}
                    onClick={async () => {
                        setLoading(true);
                        setPageLoading(true);
                        await axios
                            .delete(`${serverURL}/cheets/${reply.cheetId}/replies/${reply.id}`, {
                                withCredentials: true,
                            })
                            .then((res) => {
                                setReplies(res.data);
                            })
                            .catch((error: unknown) => {
                                axios.isAxiosError(error) && [401, 403, 404].includes(error.response?.status!)
                                    ? setError(error.response?.data)
                                    : setError("An unexpected error occured while deleting reply.");
                            });
                        setLoading(false);
                        setPageLoading(false);
                    }}
                >
                    DELETE
                </button>
            ) : null}
        </div>
    );
};

export default Reply;
