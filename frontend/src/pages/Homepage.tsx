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
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [isCheetsLoading, setCheetsLoading] = useState<boolean>(true);
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
                    .then((res: { data: ICheet[] }) => {
                        setCheets(res.data);
                    })
                    .catch(() => {
                        setCheetsError("An unexpected error occured while loading cheets.");
                    });
                setCheetsLoading(false);
                setLoading(false);
            })
            .catch((error: unknown) => {
                if (axios.isAxiosError(error) && error.response?.status == 401) {
                    setUserId(undefined);
                } else if (axios.isAxiosError(error) && error.code == "ERR_NETWORK") {
                    setError("Network Error: Servers unreachable.");
                } else {
                    setError("An unexpected error occured while authenticating the user.");
                }
                setLoading(false);
            });
    }, []);

    return (
        <Layout isLoading={isLoading} setLoading={setLoading} userId={userId} setUserId={setUserId}>
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
                                                  cheet={cheet}
                                                  userId={userId}
                                                  setCheets={setCheets}
                                                  setError={setError}
                                                  key={key}
                                                  setLoading={setLoading}
                                                  isLoading={isLoading}
                                                  isModalView={false}
                                              />
                                          ))}
                                </div>
                            )}
                            <SubmitCheet
                                isDisabled={isLoading || isCheetsLoading}
                                setCheets={setCheets}
                                setCheetsError={setCheetsError}
                                setError={setError}
                                setLoading={setLoading}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        </Layout>
    );
};

export default Homepage;
