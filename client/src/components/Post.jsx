import React from "react";
import { formatISO9075 } from "date-fns";
import { Link } from "react-router-dom";

function Post({ _id, title, summary, cover, createdAt, author }) {
	
	return (
		<div className="grid sm:grid-cols-[0.9fr_1.1fr] gap-5 mb-8 grid-cols-1 bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
			<Link
				to={`/post/${_id}`}
				className="block overflow-hidden rounded-md"
			>
				<img 
					src={cover}
					alt={title}
					className="w-full h-48 sm:h-full object-cover transform hover:scale-105 transition-transform duration-300"
				/>
			</Link>
			<div className="flex flex-col justify-between space-y-3">
				<div>
					<Link to={`/post/${_id}`}>
						<h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800 hover:text-black">
							{title}
						</h2>
					</Link>
					<p className="text-xs sm:text-sm text-gray-600 mb-2 flex items-center">
						<svg
							className="w-4 h-4 mr-1"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fillRule="evenodd"
								d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
								clipRule="evenodd"
							/>
						</svg>
						<Link to={`/profile/${author._id}`} className="font-semibold text-gray-700 mr-2">
							{author.name}
						</Link>
						<svg
							className="w-4 h-4 mr-1 ml-2"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fillRule="evenodd"
								d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
								clipRule="evenodd"
							/>
						</svg>
						<time className="text-gray-500">
							{formatISO9075(new Date(createdAt))}
						</time>
					</p>
					<p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3 sm:line-clamp-none">
						{summary}
					</p>
				</div>
				<Link
					to={`/post/${_id}`}
					className="text-gray-800 hover:text-black font-medium inline-flex items-center group"
				>
					Read more
					<svg
						className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</Link>
			</div>
		</div>
	);
}

export default Post;
