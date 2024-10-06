import { Link } from "react-router-dom";
import { IMessage } from "../utils/interfaces";

interface Props {
    userId: number | undefined;
    message: IMessage;
    setError?: (arg: string) => void;
    setMessages?: (arg: IMessage[]) => void;
    isLoading?: boolean;
    setLoading?: (arg: boolean) => void;
}

const Message: React.FC<Props> = ({ userId, message, setError, setMessages, isLoading, setLoading }) => {
    return <div> 
    {userId === message.senderId ? (
        <span>{message.text}&nbsp;EDIT POSSIBLE</span>
    ) : (
        <span>{message.text}&nbsp;</span>
    )}</div>;
};

export default Message
