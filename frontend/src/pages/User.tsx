import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ICheet, IUser } from "../utils/interfaces";
import Layout from "./Layout";
import { ClipLoader } from "react-spinners";
import ErrorModal from "../components/ErrorModal";
import Cheet from "../components/Cheet";
import SubmitCheet from "../components/SubmitCheet";
import { serverURL } from "../utils/serverURL";
import MessageModal from "../components/MessageModal";

const User: React.FC = () => {
    const [isLoading, setLoading] = useState<boolean>(true);
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [error, setError] = useState<string>();
    const [username, setUsername] = useState<string>("");
    const [isUserLoading, setUserLoading] = useState<boolean>(false);
    const [cheets, setCheets] = useState<ICheet[]>([]);
    const [isCheetsLoading, setCheetsLoading] = useState<boolean>(false);
    const [cheetsError, setCheetsError] = useState<string>("");
    const [messageModalOpen, setMessageModalOpen] = useState<boolean>(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`${serverURL}/validate`, { withCredentials: true })
            .then(async (res: { data: IUser }) => {
                setUserId(res.data.id);
            })
            .catch((error: unknown) => {
                if (axios.isAxiosError(error) && error.response?.status == 401) {
                    navigate("/");
                } else {
                    setError("An unexpected error occured while authenticating the user.");
                }
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setLoading(true);
        setUserLoading(true);
        axios
            .get(`${serverURL}/users/${id}`, { withCredentials: true })
            .then(async (res: { data: IUser }) => {
                setCheetsLoading(true);
                setUsername(res.data.username);
                setUserLoading(false);
                await axios
                    .get(`${serverURL}/users/${id}/cheets`, { withCredentials: true })
                    .then((res: { data: ICheet[] }) => {
                        setCheets(res.data);
                    })
                    .catch(() => {
                        setCheetsError("An unexpected error occured while loading cheets.");
                    });
                setCheetsLoading(false);
                setLoading(false);
            })
            .catch(() => {
                setUserLoading(false);
                setLoading(false);
            });
    }, [userId]);

    return (
        <Layout isLoading={isLoading} setLoading={setLoading} userId={userId} setUserId={setUserId}>
            <div>
                <ErrorModal errors={error ? [error] : []} closeModal={() => setError(undefined)} />
                <MessageModal
                    userId={userId}
                    recipientId={Number(id)}
                    isOpen={messageModalOpen}
                    isLoading={isLoading}
                    setLoading={setLoading}
                    closeModal={() => setMessageModalOpen(false)}
                />
                {userId ? (
                    <div>
                        {isUserLoading ? (
                            <ClipLoader />
                        ) : (
                            <div>
                                <h1>
                                    {username ? username : "Error loading user"}
                                    {userId === Number(id) ? null : (
                                        <button onClick={() => setMessageModalOpen(true)}>Message</button>
                                    )}
                                </h1>
                                {isCheetsLoading ? (
                                    <ClipLoader />
                                ) : (
                                    <div>
                                        {cheetsError
                                            ? cheetsError
                                            : cheets.map((cheet, key) => (
                                                  <Cheet
                                                      cheet={cheet}
                                                      userId={userId}
                                                      setCheets={setCheets}
                                                      setError={setError}
                                                      key={key}
                                                      setLoading={setLoading}
                                                      isLoading={isLoading}
                                                  />
                                              ))}
                                    </div>
                                )}
                                {userId === Number(id) ? (
                                    <SubmitCheet
                                        setCheetsError={setCheetsError}
                                        isDisabled={isLoading || isCheetsLoading || !username}
                                        setCheets={setCheets}
                                        setError={setError}
                                        setLoading={setLoading}
                                    />
                                ) : null}
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </Layout>
    );
};

export default User;
