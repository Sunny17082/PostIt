import React, { useEffect, useState } from "react";
import Post from "../components/Post";
import Pagination from "../components/Pagination";

function IndexPage() {
	const [posts, setPosts] = useState([]);
	const [pageNumber, setPageNumber] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [search, setSearch] = useState("");
	const [tags, setTags] = useState(["Code", "Web", "MERN", "COBOL", "Other"]);
	const [activeTag, setActiveTag] = useState([]);
	const [select, setSelect] = useState(3);
	const [sort, setSort] = useState(-1);

	useEffect(() => {
		fetch(
			`http://localhost:5000/api/post?page=${pageNumber}&search=${search}&tagPost=${activeTag.join(",")}&select=${select}&sort=${sort}`
		).then((response) => {
			response.json().then((posts) => {
				setPosts(posts.postDoc);
				setTotalPages(posts.totalPages);
			});
		});

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}, [pageNumber, totalPages, search, activeTag, select, sort]);

	return (
		<>
			<div className="mb-5">
				<input
					type="text"
					value={search}
					placeholder={"Search by title"}
					onChange={(ev) => setSearch(ev.target.value)}
				/>
			</div>
			<div className="mb-10 flex justify-between">
				<div>
					{tags.map((tag) => (
						<span
							key={tag}
							className={`px-2 py-1 mr-2 ${
								activeTag.includes(tag)
									? "bg-[#333] text-white"
									: "bg-[#d5d5d5]"
							} rounded-lg cursor-pointer`}
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
				</div>
				<div className="flex gap-[5px]">
					<label>Sort by</label>
					<select className="bg-[#d5d5d5] rounded-md px-2" value={sort} onChange={(ev) => setSort(ev.target.value)}>
						<option value="-1">latest</option>
						<option value="1">earliest</option>
					</select>
				</div>
				<div className="flex gap-[5px]">
					<label>Show</label>
					<select
						className="bg-[#d5d5d5] rounded-md px-2"
						value={select}
						onChange={(ev) => setSelect(ev.target.value)}
					>
						<option value="3">3</option>
						<option value="5">5</option>
						<option value="10">10</option>
					</select>
				</div>
			</div>
			{posts.length > 0 && posts.map((post) => <Post {...post} />)}
			<Pagination
				pageNumber={pageNumber}
				setPageNumber={setPageNumber}
				totalPages={totalPages}
			/>
		</>
	);
}

export default IndexPage;
