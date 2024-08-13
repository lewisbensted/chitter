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
    const [isCheetsLoading, setCheetsLoading] = useState<boolean>(true);
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [cheets, setCheets] = useState<ICheet[]>([]);
    const [error, setError] = useState<string>();
    const [cheetsError, setCheetsError] = useState<string>("");

    useEffect(() => {
        axios
            .get(`${serverURL}/validate`, { withCredentials: true })
            .then(async (res: { data: IUser }) => {
                setUserId(res.data.id);
                await axios
                    .get(`${serverURL}/cheets`, { withCredentials: true })
                    .then((res: { data: { cheets: ICheet[] } }) => {
                        setCheets(res.data.cheets);
                    })
                    .catch(() => {
                        setCheetsError("An unexpected error occured while loading cheets.");
                    });
                setCheetsLoading(false);
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
            isLoading={isPageLoading}
            setLoading={setPageLoading}
            userId={userId}
            setUserId={setUserId}
        >
            <div>
                <ErrorModal errors={error ? [error] : []} closeModal={() => setError(undefined)} />
                <h1>Welcome to Chitter</h1>
                <div>
                    {userId ? (
                        <div>
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
                            <SubmitCheet
                                isDisabled={isPageLoading}
                                setCheets={setCheets}
                                setCheetsError ={setCheetsError}
                                setError={setError}
                                setPageLoading={setPageLoading}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        </Layout>
    );
};

export default Homepage;
