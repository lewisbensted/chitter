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
    isCheetsLoading: boolean;
    setError: (arg: string) => void;
    setCheetsLoading: (arg: boolean) => void;
    setCheets: (arg: ICheet[]) => void;
    isPageLoading: boolean
    setPageLoading: (arg: boolean) => void;
}

const Cheet: React.FC<Props> = ({ userId, cheet, isCheetsLoading, setCheetsLoading, setError, setCheets, setPageLoading, isPageLoading }) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const { id } = useParams();
    const [isLoading, setLoading] = useState<boolean>(false);

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
                isCheetsLoading={isCheetsLoading}
            />
            <Link to={`/users/${cheet.userId}`}>{cheet.username}</Link> &nbsp;
            <span>{cheet.text}</span> &nbsp;
            <span>{format(cheet.createdAt, "hh:mm dd/MM/yy")}</span> &nbsp;
            <button onClick={() => setModalOpen(true)}>MORE</button> &nbsp;
            {userId === cheet.userId ? (
                <div>
                    {isLoading ? (
                        <ClipLoader />
                    ) : (
                        <button
                            disabled={isPageLoading}
                            onClick={async () => {
                                setLoading(true);
                                setPageLoading(true)
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
                                setLoading(false);
                                setPageLoading(false)
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
