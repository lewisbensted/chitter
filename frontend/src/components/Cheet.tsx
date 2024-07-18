import React, { useState } from "react";
import { ICheet } from "../utils/interfaces";
import axios from "axios";
import { format } from "date-fns";
import CheetModal from "./CheetModal";
import { Link, useParams } from "react-router-dom";
import { serverURL } from "../utils/serverURL";

interface Props {
    userId: number | undefined;
    cheet: ICheet;
    isCheetsLoading: boolean;
    setError: (arg: string) => void;
    setLoading: (arg: boolean) => void;
    setCheets: (arg: ICheet[]) => void;
}

const Cheet: React.FC<Props> = ({ userId, cheet, isCheetsLoading, setLoading, setError, setCheets }) => {
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const { id } = useParams();

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
                isCheetsLoading = {isCheetsLoading}
            />
            <Link to={`/users/${cheet.userId}`}>{cheet.username}</Link> &nbsp;
            <span>{cheet.text}</span> &nbsp;
            <span>{format(cheet.createdAt, "hh:mm dd/MM/yy")}</span> &nbsp;
            <button onClick={() => setModalOpen(true)}>MORE</button> &nbsp;
            {userId === cheet.userId ? (
                <button
                    disabled={isCheetsLoading}
                    onClick={async () => {
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
                        setLoading(false);
                    }}
                >
                    DELETE
                </button>
            ) : null}
        </div>
    );
};

export default Cheet;
