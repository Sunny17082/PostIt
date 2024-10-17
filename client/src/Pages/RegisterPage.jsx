import axios from "axios";
import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";

function RegisterPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [errors, setErrors] = useState({});

	async function register(ev) {
		ev.preventDefault();
		setErrors({});
		try {
			const response = await axios.post(
				"/user/register",
				{ username, name, password },
				{
					headers: { "Content-Type": "application/json" },
				}
			);
			if (response.status === 200) {
				alert("Registration successful!");
			}
		} catch (err) {
			if (err.response && err.response.data && err.response.data.errors) {
				const formattedErrors = {};
				err.response.data.errors.forEach((error) => {
					formattedErrors[error.path] = error.msg;
				});
				setErrors(formattedErrors);
			} else {
				console.log(err.message);
				alert("Registration failed!");
			}
		}
	}

	function handleGoogleSignUp() {
		window.location.href = `${
			import.meta.env.VITE_API_BASE_URL
		}/user/google`;
	} 

	return (
		<div className="my-16 mx-auto max-w-md px-4 sm:px-6 lg:px-8">
			<div className="space-y-8">
				<div>
					<h2 className="text-3xl font-bold text-center text-gray-900">
						Register
					</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={register}>
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
								placeholder="username"
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
							<label className="block text-sm font-medium text-gray-700">
								Name
							</label>
							<input
								name="name"
								type="text"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
								placeholder="name"
								value={name}
								onChange={(ev) => setName(ev.target.value)}
							/>
							{errors.name && (
								<p className="text-red-500 text-xs mt-1">
									{errors.name}
								</p>
							)}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Password
							</label>
							<input
								name="password"
								type="password"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
								placeholder="password"
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
							Register
						</button>
					</div>
				</form>
				<div className="text-sm text-center">
					Already have an account?{" "}
					<Link
						to="/login"
						className="font-medium text-gray-600 hover:text-gray-500"
					>
						Sign in
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
							onClick={handleGoogleSignUp}
							className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
						>
							<FaGoogle className="mr-2" />
							Sign up with Google
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default RegisterPage;
