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

interface Props {
	userId: number | undefined;
	cheet: ICheet;
	isOpen: boolean;
	closeModal: () => void;
	setCheets: (arg: ICheet[]) => void;
}

const CheetModal: React.FC<Props> = ({ userId, cheet, isOpen, closeModal, setCheets }) => {
	const [isPageLoading, setPageLoading] = useState<boolean>(true);
	const [isEditFormLoading, setEditFormLoading] = useState<boolean>(false);
	const [isReplyFormLoading, setReplyFormLoading] = useState<boolean>(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [repliesError, setRepliesError] = useState<string>("");
	const [replies, setReplies] = useState<IReply[]>([]);

	useEffect(() => {
		if (isOpen) {
			axios
				.get(`/cheets/${cheet.id}/replies`)
				.then((res) => {
					setReplies(res.data);
					setPageLoading(false);
				})
				.catch(() => {
					setRepliesError("Could not load replies");
					setPageLoading(false);
				});
		}
	}, [isOpen]);

	return (
		<ReactModal
			isOpen={isOpen}
			ariaHideApp={false}>
			<ErrorModal
				errors={errors}
				closeModal={() => setErrors([])}
			/>
			<div>
				<Link to={`/users/${cheet.userId}`}>{cheet.username}</Link> &nbsp;
				{userId === cheet.userId ? (
					<EditCheet
						cheet={cheet}
						isDisabled={isPageLoading || isReplyFormLoading}
						isLoading={isEditFormLoading}
						setLoading={setEditFormLoading}
						setCheets={setCheets}
						setErrors={setErrors}
					/>
				) : (
					<span>{cheet.text}</span>
				)}
			</div>
			<div>
				{isPageLoading ? (
					<ClipLoader />
				) : repliesError ? (
					<div>{repliesError}</div>
				) : (
					replies.map((reply, key) => (
						<Reply
							isDisabled={isEditFormLoading || isReplyFormLoading}
							userId={userId}
							cheetId={cheet.id}
							reply={reply}
							key={key}
							setReplies={setReplies}
							setRepliesLoading={setPageLoading}
							setError={setErrors}
							repliesLoading={isPageLoading}
						/>
					))
				)}
			</div>

			<SubmitReply
				isDisabled={isPageLoading || isEditFormLoading}
				isLoading={isReplyFormLoading}
				cheetId={cheet.id}
				setRepliesLoading={setPageLoading}
				setReplies={setReplies}
				setError={setErrors}
			/>

			<div>
				<button
					onClick={closeModal}
					disabled={isReplyFormLoading}>
					Close Modal
				</button>
			</div>
		</ReactModal>
	);
};
export default CheetModal;
