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
    userId: number | undefined;
    cheet: ICheet;
    isOpen: boolean;
    closeModal: () => void;
    setCheets: (arg: ICheet[]) => void;
    isPageLoading: boolean;
    setPageLoading: (arg: boolean) => void;
}

const CheetModal: React.FC<Props> = ({
    userId,
    cheet,
    isOpen,
    closeModal,
    setCheets,
    setPageLoading,
    isPageLoading,
}) => {
    const [isRepliesLoading, setRepliesLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>();
    const [repliesError, setRepliesError] = useState<string>("");
    const [replies, setReplies] = useState<IReply[]>([]);

    useEffect(() => {
        if (isOpen) {
            setPageLoading(true);
            axios
                .get(`${serverURL}/cheets/${cheet.id}/replies`, {
                    withCredentials: true,
                })
                .then((res) => {
                    setReplies(res.data);
                    setRepliesLoading(false);
                    setPageLoading(false);
                })
                .catch(() => {
                    setRepliesError("An unexpected error occured while loading replies.");
                    setRepliesLoading(false);
                    setPageLoading(false);
                });
        }
    }, [isOpen]);

    return (
        <ReactModal isOpen={isOpen} ariaHideApp={false}>
            <ErrorModal errors={error ? [error] : []} closeModal={() => setError(undefined)} />
            <div>
                <Link to={`/users/${cheet.userId}`}>{cheet.username}</Link> &nbsp;
                {userId === cheet.userId ? (
                    <EditCheet
                        cheet={cheet}
                        isDisabled={isPageLoading}
                        setPageLoading={setPageLoading}
                        setCheets={setCheets}
                        setError={setError}
                    />
                ) : (
                    <span>{cheet.text}</span>
                )}
            </div>
            <div>
                {isRepliesLoading ? (
                    <ClipLoader />
                ) : repliesError ? (
                    <div>{repliesError}</div>
                ) : (
                    replies.map((reply, key) => (
                        <Reply
                            isPageLoading={isPageLoading}
                            userId={userId}
                            cheetId={cheet.id}
                            reply={reply}
                            key={key}
                            setReplies={setReplies}
                            setError={setError}
                            setPageLoading={setPageLoading}
                        />
                    ))
                )}
            </div>

            <SubmitReply
                cheetId={cheet.id}
                isDisabled={isPageLoading}
                setReplies={setReplies}
                setError={setError}
                setPageLoading={setPageLoading}
            />

            <div>
                <button onClick={closeModal} disabled={isRepliesLoading}>
                    Close Modal
                </button>
            </div>
        </ReactModal>
    );
};
export default CheetModal;
