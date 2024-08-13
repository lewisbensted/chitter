import React, { useState } from "react";
import { ICheet } from "../utils/interfaces";
import axios from "axios";
import { format } from "date-fns";
import CheetModal from "./CheetModal";
import { Link, useParams } from "react-router-dom";
import { serverURL } from "../utils/serverURL";
import { ClipLoader } from "react-spinners";

interface Props {
    userId: number | undefined;
    cheet: ICheet;
    setError: (arg: string) => void;
    setCheets: (arg: ICheet[]) => void;
    isLoading: boolean;
    setLoading: (arg: boolean) => void;
}

const Cheet: React.FC<Props> = ({
    userId,
    cheet,
    setError,
    setCheets,
    setLoading,
    isLoading,
}) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const { id } = useParams();
    const [isCheetLoading, setCheetLoading] = useState<boolean>(false);

    return (
        <div>
            <CheetModal
                cheet={cheet}
                userId={userId}
                isOpen={modalOpen}
                closeModal={() => {
                    setModalOpen(false);
                }}
                setCheets={setCheets}
                isLoading={isLoading}
                setLoading={setLoading}
            />
            <Link to={`/users/${cheet.userId}`}>{cheet.username}</Link> &nbsp;
            <span>{cheet.text}</span> &nbsp;
            <span>{format(cheet.createdAt, "hh:mm dd/MM/yy")}</span> &nbsp;
            <button onClick={() => setModalOpen(true)}>MORE</button> &nbsp;
            {userId === cheet.userId ? (
                <div>
                    {isCheetLoading ? (
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
                                    .then((res) => {
                                        setCheets(res.data.cheets);
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
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default Cheet;
