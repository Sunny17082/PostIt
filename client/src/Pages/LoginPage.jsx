import React, { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { FaGoogle } from "react-icons/fa";
import axios from "axios";

function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [redirect, setRedirect] = useState(false);
	const { setUserInfo } = useContext(UserContext);
	const [errors, setErrors] = useState({});

	async function login(ev) {
		ev.preventDefault();
		try {
			const response = await axios.post("/user/login", { username, password }, {
				headers: { "Content-Type": "application/json" }
			});
			if (response.status === 200) {
				setUserInfo(response.data);
				setRedirect(true);
				alert("Login successful!");
			}
		} catch (err) {
			if (err.response && err.response.data) {
				const formattedErrors = {};
				formattedErrors[err.response.data.path] = err.response.data.msg;
				setErrors(formattedErrors);
			}
			console.log(err.response.data);
		}
	}

	function handleGoogleSignIn() {
		window.location.href = `${
			import.meta.env.VITE_API_BASE_URL
		}/user/google`;
	}

	if (redirect) {
		return <Navigate to="/" />;
	}

	return (
		<div className="my-16 mx-auto max-w-md px-4 sm:px-6 lg:px-8">
			<div className="space-y-8">
				<div>
					<h2 className="text-3xl font-bold text-center text-gray-900">
						Login
					</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={login}>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Username
							</label>
							<input
								name="username"
								type="text"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
								placeholder="Enter your username"
								value={username}
								onChange={(ev) => setUsername(ev.target.value)}
							/>
							{errors.username && (
								<p className="text-red-500 text-xs mt-1">
									{errors.username}
								</p>
							)}
						</div>
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
								placeholder="Enter your password"
								value={password}
								onChange={(ev) => setPassword(ev.target.value)}
							/>
							{errors.password && (
								<p className="text-red-500 text-xs mt-1">
									{errors.password}
								</p>
							)}
						</div>
					</div>

					<div>
						<button
							type="submit"
							className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
						>
							Sign in
						</button>
					</div>
				</form>
				<div className="text-sm text-center">
					Don't have an account?{" "}
					<Link
						to="/register"
						className="font-medium text-gray-600 hover:text-gray-500"
					>
						Sign up
					</Link>
				</div>
				<div className="mt-6">
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-white text-gray-500">
								Or continue with
							</span>
						</div>
					</div>
					<div className="mt-6">
						<button
							onClick={handleGoogleSignIn}
							className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
						>
							<FaGoogle className="mr-2" />
							Sign in with Google
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default LoginPage;
