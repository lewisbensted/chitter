import axios from "axios";

const logout = (
	setLoading: (arg: boolean) => void,
	setUserId: (arg: number | undefined) => void,
	setCheets: (arg: []) => void
) => {
	setLoading(true);
	axios
		.delete("/logout")
		.then(() => {
			setUserId(undefined);
			setCheets([]);
			setLoading(false);
		})
		.catch(() => {
			setLoading(false);
		});
};

export default logout;
