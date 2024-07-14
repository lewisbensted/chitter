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
    const [isFormLoading, setFormLoading] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [cheets, setCheets] = useState<ICheet[]>([]);
    const [error, setError] = useState<string>();
    const [cheetsError, setCheetsError] = useState<string>("");
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`${serverURL}/validate`, { withCredentials: true })
            .then((res: { data: IUser }) => {
                setUserId(res.data.id);
                axios
                    .get(`${serverURL}/users/${id}/cheets`, { withCredentials: true })
                    .then((res: { data: { user:IUser, cheets: ICheet[] } }) => {
                        setUsername(res.data.user.username)
                        setCheets(res.data.cheets);
                        setPageLoading(false);
                    })
                    .catch((error: unknown) => {
                        if (axios.isAxiosError(error) && error.response?.status == 404) {
                            navigate("/");
                        } else {
                            setError("An unexpected error occured while fetching cheets.");
                        }
                        setPageLoading(false);
                    });
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

    return (
        <Layout
            isLoading={isPageLoading || isFormLoading}
            setLoading={setPageLoading}
            setCheets={setCheets}
            userId={userId}
            setUserId={setUserId}
        >
            <div>
                <ErrorModal errors={error ? [error] : []} closeModal={() => setError(undefined)} />
                {username ? (
                    <div>
                        <ErrorModal errors={error ? [error] : []} closeModal={() => setError(undefined)} />
                        <h1>{username}</h1>
                        {isPageLoading ? (
                            <ClipLoader />
                        ) : (
                            <div>
                                {cheetsError
                                    ? cheetsError
                                    : cheets.map((cheet, key) => (
                                          <Cheet
                                              isDisabled={isFormLoading}
                                              cheet={cheet}
                                              userId={userId}
                                              setCheets={setCheets}
                                              setLoading={setPageLoading}
                                              setError={setError}
                                              key={key}
                                          />
                                      ))}
                            </div>
                        )}
                        {userId === Number(id) ? (
                            <SubmitCheet
                                isLoading={isFormLoading}
                                isDisabled={isPageLoading}
                                setLoading={setFormLoading}
                                setCheets={setCheets}
                                setError={setError}
                            />
                        ) : null}
                    </div>
                ) : (
                    <ClipLoader />
                )}
            </div>
        </Layout>
    );
};

export default User;
