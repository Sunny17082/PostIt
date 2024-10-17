import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
	return (
		<div className="flex flex-col items-center justify-center -mt-16 h-screen bg-gray-100 font-sans">
			<h1 className="text-9xl font-bold text-gray-800 mb-2">404</h1>
			<h2 className="text-4xl text-gray-600 mb-8">Page Not Found</h2>
			<p className="text-xl text-gray-500 mb-8 text-center max-w-md">
				Oops! The page you're looking for doesn't exist or has been
				moved.
			</p>
			<Link
				to="/"
				className="text-lg text-gray-800 border-2 border-gray-800 px-6 py-3 rounded-lg 
                   transition duration-300 ease-in-out hover:bg-gray-800 hover:text-white"
			>
				Return to Home
			</Link>
		</div>
	);
};

export default NotFound;
