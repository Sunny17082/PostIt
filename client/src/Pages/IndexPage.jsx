import React, { useEffect, useState } from "react";
import Post from "../components/Post";
import Pagination from "../components/Pagination";
import { FaSearch, FaSort, FaEye } from "react-icons/fa";
import axios from "axios";
import { Hourglass } from "react-loader-spinner";

function IndexPage() {
	const [posts, setPosts] = useState([]);
	const [pageNumber, setPageNumber] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [search, setSearch] = useState("");
	const [tags, setTags] = useState(["Code", "Web", "MERN", "SQL", "Other"]);
	const [activeTag, setActiveTag] = useState([]);
	const [select, setSelect] = useState(3);
	const [sort, setSort] = useState(-1);
	const [following, setFollowing] = useState(false);
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
		}, 1000);

		return () => {
			clearTimeout(timer);
		}
	}, [search]);

	async function fetchPosts() {
		try {
			const response = await axios.get("/post", {
				params: {
					page: pageNumber,
					search: debouncedSearch,
					tagPost: activeTag.join(","),
					select: select,
					sort: sort,
					following: following,
				},
			});
			setIsLoading(false);
			setPosts(response.data.postDoc);
			setTotalPages(response.data.totalPages);
		} catch (error) {
			console.error("Error fetching posts:", error);
		}
	}

	useEffect(() => {
		fetchPosts();

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}, [pageNumber, debouncedSearch, activeTag, select, sort, following]);

	return (
		<div className="max-w-5xl mx-auto px-5 py-8">
			<div className="mb-8">
				<div className="relative">
					<input
						type="text"
						value={search}
						placeholder="Search by title"
						onChange={(ev) => setSearch(ev.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
					/>
					<FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
				</div>
			</div>
			<div className="mb-10 space-y-0 sm:space-y-0 flex sm:justify-between items-center">
				<div className="flex gap-2 overflow-x-scroll no-scrollbar">
					{tags.map((tag) => (
						<span
							key={tag}
							className={`px-3 py-1 text-sm font-medium rounded-full cursor-pointer transition-all ${
								activeTag.includes(tag)
									? "bg-gray-800 text-white"
									: "bg-gray-200 text-gray-800 hover:bg-gray-300"
							}`}
							onClick={() =>
								setActiveTag(
									activeTag.includes(tag)
										? activeTag.filter((t) => t !== tag)
										: [...activeTag, tag]
								)
							}
						>
							{tag}
						</span>
					))}
					<span
						className={`px-3 py-1 text-sm font-medium rounded-full cursor-pointer transition-all ${
							following
								? "bg-gray-800 text-white"
								: "bg-gray-200 text-gray-800 hover:bg-gray-300"
						}`}
						onClick={() => setFollowing(!following)}
					>
						Following
					</span>
				</div>
				<div className="flex items-center space-x-3">
					<div className="flex items-center space-x-2">
						<FaSort className="text-gray-600" />
						<select
							className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
							value={sort}
							onChange={(ev) => setSort(ev.target.value)}
						>
							<option value="-1">Latest</option>
							<option value="1">Earliest</option>
						</select>
					</div>
					<div className="flex items-center space-x-2">
						<FaEye className="text-gray-600" />
						<select
							className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
							value={select}
							onChange={(ev) => setSelect(ev.target.value)}
						>
							<option value="3">3</option>
							<option value="5">5</option>
							<option value="10">10</option>
						</select>
					</div>
				</div>
			</div>
			<div className="space-y-8">
				{posts?.length > 0 ? (
					posts.map((post) => <Post key={post._id} {...post} />)
				) : (
					<div className="text-center text-gray-500 py-8">
						{!isLoading ? <div>No posts found</div> : <div>Loading...</div>}
					</div>
				)}
			</div>
			<div className="mt-10">
				<Pagination
					pageNumber={pageNumber}
					setPageNumber={setPageNumber}
					totalPages={totalPages}
				/>
			</div>
		</div>
	);
}

export default IndexPage;
