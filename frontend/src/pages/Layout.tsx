import React, { useState } from "react";
import { Link } from "react-router-dom";
import logout from "../utils/logout";
import ErrorModal from "../components/ErrorModal";

interface Props {
	children: JSX.Element;
	isLoading: boolean;
	userId: number | undefined;
	setLoading: (arg: boolean) => void;
	setUserId: (arg: number | undefined) => void;
	setCheets: (arg: []) => void;
}

const Layout: React.FC<Props> = ({ children, isLoading, setLoading, setCheets, userId, setUserId }) => {

	const [error, setError] = useState<string>();

	return (
		<div>
			{children}
			<ErrorModal
                    errors={error ? [error] : []}
                    closeModal={() => setError(undefined)}
                  />
			{isLoading ? null : userId ? (
				<Link
					to={"/"}
					style={{ pointerEvents: isLoading ? "none" : undefined }}
					onClick={() => {
						logout(setLoading, setUserId, setCheets, setError);
					}}>
					LOGOUT
				</Link>
			) : (
				<div>
					<Link
						to='/login'
						style={{ pointerEvents: isLoading ? "none" : undefined }}>
						LOGIN
					</Link>
					&nbsp;
					<Link
						to='/register'
						style={{ pointerEvents: isLoading ? "none" : undefined }}>
						REGISTER
					</Link>
				</div>
			)}
			<div>
				{"\n"}
				<Link
					to='/'
					style={{ pointerEvents: isLoading ? "none" : undefined }}>
					HOME
				</Link>
			</div>
		</div>
	);
};

export default Layout;
