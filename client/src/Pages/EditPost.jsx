import React, { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../components/Editor";

const EditPost = () => {
	const { id } = useParams();
	const [title, setTitle] = useState("");
	const [summary, setSummary] = useState("");
	const [content, setContent] = useState("");
	const [files, setFiles] = useState("");
	const [redirect, setRedirect] = useState(false);
	const [tags, setTags] = useState([
		"Code",
		"Web",
		"MERN",
		"COBOL",
		"Other",
	]);
	const [activeTag, setActiveTag] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/api/post/" + id).then((response) => {
			response.json().then((postInfo) => {
				setTitle(postInfo.title);
				setSummary(postInfo.summary);
				setContent(postInfo.content);
				setActiveTag(postInfo.postTags);
			});
		});
	}, []);

	async function updatePost(ev) {
		ev.preventDefault();
		const data = new FormData();
		data.set("title", title);
		data.set("summary", summary);
		data.set("content", content);
		data.set("id", id);
		data.set("postTags", activeTag);
		if (files?.[0]) {
			data.set("file", files?.[0]);
		}
		data.set("postTags", activeTag);
		const response = await fetch("http://localhost:5000/api/post", {
			method: "PUT",
			body: data,
			credentials: "include",
		});
		if (response.ok) {
			setRedirect(true);
		}
	}

	if (redirect) {
		return <Navigate to={"/post/" + id} />;
	}

	return (
		<form onSubmit={updatePost}>
			<input
				type="text"
				placeholder="Title"
				value={title}
				onChange={(ev) => setTitle(ev.target.value)}
			/>
			<input
				type="text"
				placeholder="Summary"
				value={summary}
				onChange={(ev) => setSummary(ev.target.value)}
			/>
			<div
				className="bg-[#eeeeee] mb-[5px] p-[10px] rounded-[5px] border-[2px] border-[#dddddd]"
				value={tags}
			>
				{tags.map((tag) => (
					<span
						key={tag}
						className={`px-2 py-1 mr-2 ${
							activeTag.includes(tag)
								? "bg-[#333] text-white"
								: "bg-[#d5d5d5]"
						} rounded-lg cursor-pointer`}
						onClick={() => {
							if (activeTag.includes(tag)) {
								setActiveTag(
									activeTag.filter((t) => t !== tag)
								);
							} else {
								setActiveTag([...activeTag, tag]);
							}
						}}
					>
						{tag}
					</span>
				))}
			</div>
			<input type="file" onChange={(ev) => setFiles(ev.target.files)} />
			<Editor onChange={setContent} value={content} />
			<button className="btn" style={{ marginTop: "5px" }}>
				Update Post
			</button>
		</form>
	);
};

export default EditPost;
