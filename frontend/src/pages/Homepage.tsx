import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { ICheet, IUser } from "../utils/interfaces";
import { ClipLoader } from "react-spinners";
import SubmitCheet from "../components/SubmitCheet";
import Cheet from "../components/Cheet";
import ErrorModal from "../components/ErrorModal";
import { serverURL } from "../utils/serverURL";

const Homepage: React.FC = () => {
    const [isPageLoading, setPageLoading] = useState<boolean>(true);
    const [isFormLoading, setFormLoading] = useState<boolean>(false);
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [cheets, setCheets] = useState<ICheet[]>([]);
    const [error, setError] = useState<string>();
    const [cheetsError, setCheetsError] = useState<string>("");

    useEffect(() => {
        axios
            .get(`${serverURL}/validate`, { withCredentials: true })
            .then((res: { data: IUser }) => {
                setUserId(res.data.id);
                axios
                    .get(`${serverURL}/cheets`, { withCredentials: true })
                    .then((res: { data: { cheets: ICheet[] } }) => {
                        setCheets(res.data.cheets);
                    })
                    .catch(() => {
                        setCheetsError("An unexpected error occured while loading cheets.");
                    });
                setPageLoading(false);
            })
            .catch((error: unknown) => {
                if (axios.isAxiosError(error) && error.response?.status == 401) {
                    setUserId(undefined);
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
                <h1>Welcome to Chitter</h1>
                <div>
                    {userId ? (
                        <div>
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
                            <SubmitCheet
                                isLoading={isFormLoading}
                                isDisabled={isPageLoading}
                                setLoading={setFormLoading}
                                setCheets={setCheets}
                                setError={setError}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        </Layout>
    );
};

export default Homepage;
