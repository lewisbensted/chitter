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

const User: React.FC = () => {
    const [isPageLoading, setPageLoading] = useState<boolean>(true);
    const [isCheetsLoading, setCheetsLoading] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [isUserLoading, setUserLoading] = useState<boolean>(false);
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [cheets, setCheets] = useState<ICheet[]>([]);
    const [error, setError] = useState<string>();
    const [cheetsError, setCheetsError] = useState<string>("");
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
                setPageLoading(false);
            });
    }, []);

    useEffect(() => {
        setPageLoading(true);
        setUserLoading(true)
        axios
            .get(`${serverURL}/users/${id}`, { withCredentials: true })
            .then(async (res: { data: { user: IUser } }) => {
                setCheetsLoading(true);
                setUsername(res.data.user.username);
                setUserLoading(false);
                await axios
                    .get(`${serverURL}/users/${id}/cheets`, { withCredentials: true })
                    .then((res: { data: { user: IUser; cheets: ICheet[] } }) => {
                        setCheets(res.data.cheets);
                    })
                    .catch(() => {
                        setCheetsError("An unexpected error occured while loading cheets.");
                    });
                setCheetsLoading(false);
                setPageLoading(false);
            })
            .catch(() => {
                setUserLoading(false);
                setPageLoading(false);
            });
    }, [userId]);

    return (
        <Layout isLoading={isPageLoading} setLoading={setPageLoading} userId={userId} setUserId={setUserId}>
            <div>
                <ErrorModal errors={error ? [error] : []} closeModal={() => setError(undefined)} />
                {userId ? (
                    <div>
                        {isUserLoading ? (
                            <ClipLoader />
                        ) : (
                            <div>
                                <h1>{username ? username : "Error loading user"}</h1>
                                {isCheetsLoading ? (
                                    <ClipLoader />
                                ) : (
                                    <div>
                                        {cheetsError
                                            ? cheetsError
                                            : cheets.map((cheet, key) => (
                                                  <Cheet
                                                      isCheetsLoading={isCheetsLoading}
                                                      cheet={cheet}
                                                      userId={userId}
                                                      setCheets={setCheets}
                                                      setCheetsLoading={setCheetsLoading}
                                                      setError={setError}
                                                      key={key}
                                                      setPageLoading={setPageLoading}
                                                      isPageLoading={isPageLoading}
                                                  />
                                              ))}
                                    </div>
                                )}
                                {userId === Number(id) ? (
                                    <SubmitCheet
                                        setCheetsError={setCheetsError}
                                        isDisabled={isPageLoading || !username}
                                        setCheets={setCheets}
                                        setError={setError}
                                        setPageLoading={setPageLoading}
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
