import React from "react";
import { IReply } from "../utils/interfaces";
import { format } from "date-fns";
import axios from "axios";
import { Link } from "react-router-dom";

import EditReply from "./EditReply";

interface Props {
	userId: number | undefined;
	cheetId: number;
	reply: IReply;
	setError: (arg: string[]) => void;
	setRepliesLoading: (arg: boolean) => void;
	setReplies: (arg: IReply[]) => void;
	repliesLoading: boolean;
	isDisabled: boolean
}

const Reply: React.FC<Props> = ({
	userId,
	cheetId,
	reply,
	setReplies,
	setRepliesLoading,
	setError,
	repliesLoading,
	isDisabled
}) => {
	return (
		<div>
			<Link to={`/users/${reply.userId}`}>{reply.username}</Link> &nbsp;
			{userId === reply.userId ? (
				<EditReply
					cheetId={cheetId}
					reply={reply}
					isDisabled={isDisabled}
					setRepliesLoading={setRepliesLoading}
					setReplies={setReplies}
					setErrors={setError}
					repliesLoading={repliesLoading}
				/>
			) : (
				<span>{reply.text}&nbsp;</span>
			)}
			<span>{format(reply.createdAt, "hh:mm dd/MM/yy")}</span>&nbsp;
			{userId === reply.userId ? (
				<button
					disabled={isDisabled}
					onClick={() => {
						setRepliesLoading(true);
						axios
							.delete(`/cheets/${reply.cheetId}/replies/${reply.id}`)
							.then((res) => {
								setReplies(res.data);
								setRepliesLoading(false);
							})
							.catch((error: unknown) => {
								axios.isAxiosError(error) && (error.response?.status == 401 || 403 || 404)
									? setError([error.response?.data])
									: setError(["Could not delete reply"]);
								setRepliesLoading(false);
							});
					}}>
					DELETE
				</button>
			) : null}
		</div>
	);
};

export default Reply;
