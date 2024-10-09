import { Link } from "react-router-dom";
import { IMessage } from "../utils/interfaces";
import { ClipLoader } from "react-spinners";
import { useState } from "react";
import axios from "axios";
import { serverURL } from "../utils/serverURL";

interface Props {
    userId: number | undefined;
    message: IMessage;
    setError: (arg: string) => void;
    setMessages: (arg: IMessage[]) => void;
    isLoading: boolean;
    setLoading: (arg: boolean) => void;
}

const Message: React.FC<Props> = ({ userId, message, setError, setMessages, isLoading, setLoading }) => {
    const [isMessageLoading, setMessageLoading] = useState<boolean>(false);

    return (
        <div>
            {message.text}&nbsp;
            {userId === message.senderId ? (
                isMessageLoading ? (
                    <ClipLoader />
                ) : (
                    <button
                        disabled={isLoading}
                        onClick={async () => {
                            setMessageLoading(true);
                            setLoading(true);
                            await axios
                                .delete(`${serverURL}/messages/${message.recipientId}/message/${message.id}`, {
                                    withCredentials: true,
                                })
                                .then((res: { data: IMessage[] }) => {
                                    setMessages(res.data);
                                })
                                .catch((error: unknown) => {
                                    axios.isAxiosError(error) && [401, 403].includes(error.response?.status!)
                                        ? setError(error.response?.data)
                                        : setError("An unexpected error occured while deleting message.");
                                });
                            setMessageLoading(false);
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

export default Message;
