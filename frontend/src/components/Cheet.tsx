import React, { useState } from "react";
import { ICheet } from "../utils/interfaces";
import axios from "axios";
import { format, formatISO } from "date-fns";
import CheetModal from "./CheetModal";
import { Link, useParams } from "react-router-dom";
import { serverURL } from "../utils/serverURL";
import { ClipLoader } from "react-spinners";
import EditCheet from "./EditCheet";
import { formatInTimeZone } from "date-fns-tz";

interface Props {
    userId?: number;
    cheet: ICheet;
    setError: (arg: string) => void;
    setCheets: (arg: ICheet[]) => void;
    isLoading: boolean;
    setLoading: (arg: boolean) => void;
    isModalView: boolean;
}

const Cheet: React.FC<Props> = ({ userId, cheet, setError, setCheets, setLoading, isLoading, isModalView }) => {
    const { id } = useParams();
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [isCheetLoading, setCheetLoading] = useState<boolean>(false);

    const createdAt = new Date(new Date(cheet.createdAt).valueOf() + new Date(cheet.createdAt).getTimezoneOffset() * 60000)
    const updatedAt = new Date(new Date(cheet.updatedAt).valueOf() + new Date(cheet.updatedAt).getTimezoneOffset() * 60000)

    return (
        <div>
            <CheetModal
                cheet={cheet}
                userId={userId}
                isOpen={isModalOpen}
                closeModal={() => {
                    setModalOpen(false);
                }}
                setCheets={setCheets}
                isLoading={isLoading}
                setLoading={setLoading}
            />
            <Link to={`/users/${cheet.userId}`}>{cheet.username}</Link> &nbsp;
            <EditCheet
                cheet={cheet}
                isDisabled={isLoading}
                setLoading={setLoading}
                setCheets={setCheets}
                setError={setError}
                userId={userId}
            />
            &nbsp;
            <span>{format(createdAt, "HH:mm dd/MM/yy")}</span> &nbsp;
            {updatedAt > createdAt ? (
                <span>{`Edited at ${(format(updatedAt, "HH:mm dd/MM/yy"))}`} &nbsp;</span>
            ) : null}
            {isModalView ? null : <button onClick={() => setModalOpen(true)}>MORE</button>} &nbsp;
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
                                    axios.isAxiosError(error) && [401, 403].includes(error.response?.status!)
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
