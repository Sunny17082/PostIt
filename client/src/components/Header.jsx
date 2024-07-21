import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";

function Header() {
	const { setUserInfo, userInfo } = useContext(UserContext);

	useEffect(() => {
		fetch("http://localhost:5000/profile", {
			credentials: "include",
		}).then((response) => {
			response.json().then((userInfo) => {
				setUserInfo(userInfo);
			});
		});
	}, []);

	function logout() {
		fetch("http://localhost:5000/logout", {
			credentials: "include",
			method: "POST",
		});
		setUserInfo(null);
	}

	const username = userInfo?.username;
	
	return (
		<header>
			<Link to="/" className="logo">
				PostIt
			</Link>
			<nav>
				{username && (
					<>
						<span>Hello, {username}</span>
						<Link to="/create">Create new post</Link>
						<a onClick={logout}>Logout</a>
					</>
				)}
				{!username && (
					<>
						<Link to="/login">Login</Link>
						<Link to="/Register">Register</Link>
					</>
				)}
			</nav>
		</header>
	);
}

export default Header;
