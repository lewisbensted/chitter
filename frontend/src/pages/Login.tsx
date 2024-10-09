import axios from "axios";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import ErrorModal from "../components/ErrorModal";
import Layout from "./Layout";
import { serverURL } from "../utils/serverURL";

interface LoginFormFields {
    username: string;
    password: string;
}

const Login: React.FC = () => {
    const { register, handleSubmit, reset } = useForm<LoginFormFields>();
    const navigate = useNavigate();

    const [isLoading, setLoading] = useState<boolean>(true);
    const [isFormLoading, setFormLoading] = useState<boolean>(false);
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const [error, setError] = useState<string>();

    useEffect(() => {
        axios
            .get(`${serverURL}/validate`, { withCredentials: true })
            .then(() => {
                navigate("/");
            })
            .catch((error: unknown) => {
                if (axios.isAxiosError(error) && error.response?.status == 401) {
                    setUserId(undefined);
                } else {
                    setError("An unexpected error occured while authenticating the user.");
                }
                setLoading(false);
            });
    }, []);

    const onSubmit: SubmitHandler<LoginFormFields> = (data) => {
        setFormLoading(true);
        reset();
        axios
            .post(`${serverURL}/login`, data, { withCredentials: true })
            .then(() => {
                navigate("/");
            })
            .catch((error: unknown) => {
                axios.isAxiosError(error) && [400, 401 , 403 , 404].includes(error.response?.status!)
                    ? setError(error.response?.data)
                    : setError("An unexpected error occured while logging in.");
                setFormLoading(false);
            });
    };

    return (
        <Layout
            isLoading={isLoading || isFormLoading}
            setLoading={setLoading}
            userId={userId}
            setUserId={setUserId}
        >
            <div>
                <ErrorModal errors={error ? [error] : []} closeModal={() => setError(undefined)} />
                <h1>Login Page</h1>
                {isLoading ? (
                    <ClipLoader />
                ) : (
                    <div>
                     
                        <form onSubmit={handleSubmit(onSubmit)}>
                            Username:
                            <input {...register("username")} type="text" />
                            {"\n"}
                            Password:
                            <input {...register("password")} type="text" />
                            {isFormLoading ? <ClipLoader /> : <input type="submit" disabled={userId != undefined} />}
                        </form>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Login;
