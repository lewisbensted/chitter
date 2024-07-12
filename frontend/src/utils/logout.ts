import axios from "axios";
import { serverURL } from "./serverURL";

const logout = (
	setLoading: (arg: boolean) => void,
	setUserId: (arg: number | undefined) => void,
	setCheets: (arg: []) => void,
	setError: (arg: string) => void
) => {
	setLoading(true);
	axios
		.delete(`${serverURL}/logout`, {withCredentials: true})
		.then(() => {
			setUserId(undefined);
			setCheets([]);
			setLoading(false);
		})
		.catch((error) => {
			setLoading(false);
			setError(error.response.data)
		});
};

export default logout;
