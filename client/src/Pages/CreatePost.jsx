import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import Editor from "../components/Editor";

function CreatePost() {
	const [title, setTitle] = useState("");
	const [summary, setSummary] = useState("");
	const [content, setContent] = useState("");
	const [files, setFiles] = useState("");
	const [redirect, setRedirect] = useState(false);
	const [tags, setTags] = useState(["Code", "Web", "MERN", "COBOL", "Other"]);
	const [activeTag, setActiveTag] = useState([]);

	async function createNewpost(ev) {
		const data = new FormData();
		data.set("title", title);
		data.set("summary", summary);
		data.set("content", content);
		data.set("file", files[0]);
		data.append("postTags", activeTag);

		ev.preventDefault();
		const response = await fetch("http://localhost:5000/api/post", {
			method: "POST",
			body: data,
			credentials: "include",
		});
		if (response.ok) {
			setRedirect(true);
		}
	}

	if (redirect) {
		return <Navigate to="/" />;
	}

	return (
		<form onSubmit={createNewpost}>
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
							setActiveTag((prevTags) => {
								if (prevTags.includes(tag)) {
									return prevTags.filter((t) => t !== tag);
								} else {
									return [...prevTags, tag];
								}
							});
						}}
					>
						{tag}
					</span>
				))}
			</div>
			<input type="file" onChange={(ev) => setFiles(ev.target.files)} />
			<Editor onChange={setContent} value={content} />
			<button className="btn" style={{ marginTop: "5px" }}>
				Create Post
			</button>
		</form>
	);
}

export default CreatePost;
