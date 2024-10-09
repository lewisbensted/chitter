import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { ICheet, IReply } from "../utils/interfaces";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import ErrorModal from "./ErrorModal";
import Reply from "./Reply";
import SubmitReply from "./SubmitReply";
import EditCheet from "./EditCheet";
import { Link } from "react-router-dom";
import { serverURL } from "../utils/serverURL";

interface Props {
    userId?: number;
    cheet: ICheet;
    isOpen: boolean;
    closeModal: () => void;
    setCheets: (arg: ICheet[]) => void;
    isLoading: boolean;
    setLoading: (arg: boolean) => void;
}

const CheetModal: React.FC<Props> = ({ userId, cheet, isOpen, closeModal, setCheets, setLoading, isLoading }) => {
    const [error, setError] = useState<string>();
    const [replies, setReplies] = useState<IReply[]>([]);
    const [repliesError, setRepliesError] = useState<string>("");
    const [isRepliesLoading, setRepliesLoading] = useState<boolean>(true);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            axios
                .get(`${serverURL}/cheets/${cheet.id}/replies`, {
                    withCredentials: true,
                })
                .then((res: { data: IReply[] }) => {
                    setReplies(res.data);
                    setRepliesLoading(false);
                    setLoading(false);
                })
                .catch(() => {
                    setRepliesError("An unexpected error occured while loading replies.");
                    setRepliesLoading(false);
                    setLoading(false);
                });
        }
    }, [isOpen]);

    return (
        <ReactModal isOpen={isOpen} ariaHideApp={false}>
            <ErrorModal errors={error ? [error] : []} closeModal={() => setError(undefined)} />
            <div>
                <Link to={`/users/${cheet.userId}`}>{cheet.username}</Link> &nbsp;
                <EditCheet
                    cheet={cheet}
                    isDisabled={isLoading || isRepliesLoading}
                    setLoading={setLoading}
                    setCheets={setCheets}
                    setError={setError}
                    userId={userId}
                />
            </div>
            <div>
                {isRepliesLoading ? (
                    <ClipLoader />
                ) : repliesError ? (
                    repliesError
                ) : (
                    replies.map((reply, key) => (
                        <Reply
                            isLoading={isLoading}
                            userId={userId}
                            cheetId={cheet.id}
                            reply={reply}
                            key={key}
                            setReplies={setReplies}
                            setError={setError}
                            setLoading={setLoading}
                        />
                    ))
                )}
            </div>

            <SubmitReply
                cheetId={cheet.id}
                isDisabled={isLoading || isRepliesLoading}
                setReplies={setReplies}
                setError={setError}
                setLoading={setLoading}
            />

            <div>
                <button onClick={closeModal} disabled={isLoading || isRepliesLoading}>
                    Close Modal
                </button>
            </div>
        </ReactModal>
    );
};

export default CheetModal;
