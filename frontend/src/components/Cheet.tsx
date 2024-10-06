import React, { useState } from "react";
import { ICheet } from "../utils/interfaces";
import axios from "axios";
import { format } from "date-fns";
import CheetModal from "./CheetModal";
import { Link, useParams } from "react-router-dom";
import { serverURL } from "../utils/serverURL";
import { ClipLoader } from "react-spinners";
import MessageModal from "./MessageModal";

interface Props {
    userId: number | undefined;
    cheet: ICheet;
    setError: (arg: string) => void;
    setCheets: (arg: ICheet[]) => void;
    isLoading: boolean;
    setLoading: (arg: boolean) => void;
}

const Cheet: React.FC<Props> = ({ userId, cheet, setError, setCheets, setLoading, isLoading }) => {
    const [cheetModalOpen, setCheetModalOpen] = useState<boolean>(false);
    const [messageModalOpen, setMessageModalOpen] = useState<boolean>(false);
    const { id } = useParams();
    const [isCheetLoading, setCheetLoading] = useState<boolean>(false);

    return (
        <div>
            <CheetModal
                cheet={cheet}
                userId={userId}
                isOpen={cheetModalOpen}
                closeModal={() => {
                    setCheetModalOpen(false);
                }}
                setCheets={setCheets}
                isLoading={isLoading}
                setLoading={setLoading}
            />
            <MessageModal
                userId={userId}
                recipientId={cheet.userId}
                isOpen={messageModalOpen}
                closeModal={() => setMessageModalOpen(false)}
                isLoading={isLoading}
                setLoading={setLoading}
            />
            <Link to={`/users/${cheet.userId}`}>{cheet.username}</Link>
            {userId === cheet.userId ? null : (
                <span>
                    <button onClick={() => setMessageModalOpen(true)}>MESSAGE</button>&nbsp;
                </span>
            )}
            <span>{cheet.text}</span> &nbsp;
            <span>{format(cheet.createdAt, "hh:mm dd/MM/yy")}</span> &nbsp;
            <button onClick={() => setCheetModalOpen(true)}>MORE</button> &nbsp;
            {userId === cheet.userId ? (
                isCheetLoading ? (
                    <ClipLoader />
                ) : (
                    <button
                        disabled={isLoading}
                        onClick={async () => {
                            setCheetLoading(true);
                            setLoading(true);
                            await axios
                                .delete(`${serverURL + (id ? `/users/${id}/` : "/")}cheets/${cheet.id}`, {
                                    withCredentials: true,
                                })
                                .then((res: { data: ICheet[] }) => {
                                    setCheets(res.data);
                                })
                                .catch((error: unknown) => {
                                    axios.isAxiosError(error) && [401, 403, 404].includes(error.response?.status!)
                                        ? setError(error.response?.data)
                                        : setError("An unexpected error occured while deleting cheet.");
                                });
                            setCheetLoading(false);
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

export default Cheet;
