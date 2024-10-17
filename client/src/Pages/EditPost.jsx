import React, { useEffect, useState, useCallback } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import Editor from "../components/Editor";
import axios from "axios";

const EditPost = () => {
	const { id } = useParams();
	const [title, setTitle] = useState("");
	const [summary, setSummary] = useState("");
	const [content, setContent] = useState("");
	const [coverImage, setCoverImage] = useState(null);
	const [redirect, setRedirect] = useState(false);
	const [tags, setTags] = useState(["Code", "Web", "MERN", "SQL", "Other"]);
	const [activeTag, setActiveTag] = useState([]);

	async function getPost() {
		try {
			const response = await axios.get(`/post/${id}`);
			const postInfo = response.data;
			setTitle(postInfo.title);
			setSummary(postInfo.summary);
			setContent(postInfo.content);
			setActiveTag(postInfo.postTags);
		} catch (err) {
			console.log(err);
		}
	}

	useEffect(() => {
		getPost();
	}, [id]);

	const onDrop = useCallback((acceptedFiles) => {
		setCoverImage(acceptedFiles[0]);
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: "image/*",
		multiple: false,
	});

	async function updatePost(ev) {
		ev.preventDefault();
		const data = new FormData();
		data.set("title", title);
		data.set("summary", summary);
		data.set("content", content);
		data.set("id", id);
		if (activeTag.length === 0) {
			activeTag.push("Other");
		}
		data.set("postTags", activeTag);
		if (coverImage) {
			data.set("file", coverImage);
		}
		try {
			const response = await axios.put("/post", data);
			if (response.status === 200) {
				setRedirect(true);
			}
		} catch (err) {
			console.log(err);
		}
	}

	if (redirect) {
		return <Navigate to={"/post/" + id} />;
	}

	return (
		<div className="max-w-5xl mx-auto mt-5 mb-16 p-6 px-10 bg-white shadow-md rounded-lg">
			<h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Post</h2>
			<form onSubmit={updatePost} className="space-y-6">
				<div>
					<label
						htmlFor="title"
						className="block text-sm font-medium text-gray-700"
					>
						Title
					</label>
					<input
						id="title"
						type="text"
						placeholder="Enter title"
						value={title}
						onChange={(ev) => setTitle(ev.target.value)}
						className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
					/>
				</div>
				<div>
					<label
						htmlFor="summary"
						className="block text-sm font-medium text-gray-700"
					>
						Summary
					</label>
					<input
						id="summary"
						type="text"
						placeholder="Enter summary"
						value={summary}
						onChange={(ev) => setSummary(ev.target.value)}
						className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Tags
					</label>
					<div className="flex flex-wrap gap-2">
						{tags.map((tag) => (
							<span
								key={tag}
								className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
									activeTag.includes(tag)
										? "bg-gray-800 text-white"
										: "bg-gray-200 text-gray-800"
								}`}
								onClick={() => {
									setActiveTag((prevTags) => {
										if (prevTags.includes(tag)) {
											return prevTags.filter(
												(t) => t !== tag
											);
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
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Cover Image
					</label>
					<div
						{...getRootProps()}
						className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md ${
							isDragActive ? "bg-gray-100" : ""
						}`}
					>
						<div className="space-y-1 text-center">
							<svg
								className="mx-auto h-12 w-12 text-gray-400"
								stroke="currentColor"
								fill="none"
								viewBox="0 0 48 48"
								aria-hidden="true"
							>
								<path
									d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<div className="flex text-sm text-gray-600">
								<label
									htmlFor="file-upload"
									className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
								>
									<span>Upload a file</span>
									<input
										id="file-upload"
										{...getInputProps()}
										className="sr-only"
									/>
								</label>
								<p className="pl-1">or drag and drop</p>
							</div>
							<p className="text-xs text-gray-500">
								PNG, JPG, GIF up to 10MB
							</p>
						</div>
					</div>
					{coverImage && (
						<p className="mt-2 text-sm text-gray-600">
							Selected file: {coverImage.name}
						</p>
					)}
				</div>
				<div>
					<label
						htmlFor="content"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Content
					</label>
					<Editor onChange={setContent} value={content} />
				</div>
				<button
					type="submit"
					className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
				>
					Update Post
				</button>
			</form>
		</div>
	);
};

export default EditPost;
