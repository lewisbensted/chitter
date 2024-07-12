import React from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { IReply } from "../utils/interfaces";
import { ClipLoader } from "react-spinners";
import { serverURL } from "../utils/serverURL";

interface Props {
  cheetId: number;
  isDisabled: boolean;
  isLoading: boolean;
  setRepliesLoading: (arg: boolean) => void;
  setReplies: (arg: IReply[]) => void;
  setError: (arg: string) => void;
}

const SubmitReply: React.FC<Props> = ({
  cheetId,
  isDisabled,
  setRepliesLoading,
  setReplies,
  setError,
  isLoading,
}) => {
  const { register, handleSubmit, reset } = useForm<{ text: string }>();
  const onSubmit: SubmitHandler<{ text: string }> = (data) => {
    setRepliesLoading(true);
    reset();
    axios
      .post(`${serverURL}/cheets/${cheetId}/replies`, data, {
        withCredentials: true,
      })
      .then((res) => {
        setRepliesLoading(false);
        setReplies(res.data);
      })
      .catch((error: unknown) => {
        axios.isAxiosError(error) && (error.response?.status == 400 || 401)
          ? setError(error.response?.data)
          : setError("Could not send reply");
        setRepliesLoading(false);
      });
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        Send a Reply: &nbsp;
        <input {...register("text")} type="text" /> &nbsp;
        {isLoading ? (
          <ClipLoader />
        ) : (
          <input disabled={isDisabled} type="submit" />
        )}
      </form>
    </div>
  );
};

export default SubmitReply;
