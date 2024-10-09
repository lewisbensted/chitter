import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { IMessage } from "../utils/interfaces";
import axios from "axios";
import { serverURL } from "../utils/serverURL";
import { ClipLoader } from "react-spinners";
import Message from "./Message";
import ErrorModal from "./ErrorModal";
import SendMessage from "./SendMessage";

interface Props {
    userId?: number;
    recipientId: number;
    isOpen: boolean;
    isLoading: boolean;
    closeModal: () => void;
    setLoading: (arg: boolean) => void;
}

const MessageModal: React.FC<Props> = ({ userId, recipientId, isOpen, isLoading, closeModal, setLoading }) => {
    const [error, setError] = useState<string>();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [messagesError, setMessagesError] = useState<string>("");
    const [isMessagesLoading, setMessagesLoading] = useState<boolean>(true);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            axios
                .get(`${serverURL}/messages/${recipientId}`, {
                    withCredentials: true,
                })
                .then((res: { data: IMessage[] }) => {
                    setMessages(res.data);
                    setMessagesLoading(false);
                    setLoading(false);
                })
                .catch(() => {
                    setMessagesError("An unexpected error occured while loading messages.");
                    setLoading(false);
                    setMessagesLoading(false);
                });
        }
    }, [isOpen]);

    return (
        <ReactModal isOpen={isOpen} ariaHideApp={false}>
            <ErrorModal errors={error ? [error] : []} closeModal={() => setError(undefined)} />
            <div>
                {isMessagesLoading ? (
                    <ClipLoader />
                ) : messagesError ? (
                    messagesError
                ) : (
                    messages.map((message, key) => (
                        <Message
                            key={key}
                            userId={userId}
                            message={message}
                            setMessages={setMessages}
                            isLoading={isLoading}
                            setLoading={setLoading}
                            setError={setError}
                        />
                    ))
                )}
            </div>
            <SendMessage
                recipientId={recipientId}
                isDisabled={isLoading || isMessagesLoading}
                setMessages={setMessages}
                setError={setError}
                setLoading={setLoading}
            />
            <button onClick={closeModal} disabled={isLoading || isMessagesLoading}>
                Close Modal
            </button>
        </ReactModal>
    );
};

export default MessageModal;
