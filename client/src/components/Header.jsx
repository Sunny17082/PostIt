import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import axios from "axios";

function Header() {
	const { userInfo, setUserInfo } = useContext(UserContext);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	const getUserInfo = async () => {
		const response = await axios.get("/user/profile");
		if (response.status === 200) {
			setUserInfo(response?.data);
		}
	}

	useEffect(() => {
		getUserInfo();
	}, []);

	async function logout() {
		await axios.post("/user/logout");
		setUserInfo(null);
		setDropdownOpen(false);
	}

	const handleToggleDropdown = () => {
		setDropdownOpen(!dropdownOpen);
	};

	const handleClickOutside = (event) => {
		if (
			dropdownRef.current &&
			!dropdownRef.current.contains(event.target)
		) {
			setDropdownOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const id = userInfo?.id;

	return (
		<header className="max-w-5xl mx-auto px-5 sm:px-6 bg-white border-b border-gray-200">
			<div className="py-3 flex items-center justify-between">
				<Link
					to="/"
					className="font-bold text-2xl text-black hover:text-gray-700 transition-colors"
				>
					PostIt
				</Link>
				<nav className="flex items-center space-x-6">
					{id && (
						<Link
							to="/create"
							className="text-black hover:text-gray-700 transition-colors"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="w-6 h-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
								/>
							</svg>
						</Link>
					)}
					{!id && (
						<>
							<Link
								to="/login"
								className="text-black hover:text-gray-700 transition-colors"
							>
								Login
							</Link>
							<Link
								to="/register"
								className="text-black hover:text-gray-700 transition-colors"
							>
								Register
							</Link>
						</>
					)}
					{id && (
						<div className="relative" ref={dropdownRef}>
							<button
								onClick={handleToggleDropdown}
								className="flex items-center space-x-1 text-black hover:text-gray-700 transition-colors focus:outline-none"
							>
								<span>{userInfo.name}</span>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M19 9l-7 7-7-7"
									></path>
								</svg>
							</button>
							{dropdownOpen && (
								<div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md overflow-hidden z-10">
									<Link
										to={`/profile/${userInfo.id}`}
										className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
										onClick={() => setDropdownOpen(false)}
									>
										My Profile
									</Link>
									<Link
										to={`/settings`}
										className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
										onClick={() => setDropdownOpen(false)}
									>
										Settings
									</Link>
									<button
										onClick={logout}
										className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
									>
										Logout
									</button>
								</div>
							)}
						</div>
					)}
				</nav>
			</div>
		</header>
	);
}

export default Header;
