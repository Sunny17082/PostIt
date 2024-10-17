import React, { useState, useCallback, useEffect, useRef } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import Editor from "../components/Editor";
import axios from "axios";
import { marked } from "marked";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

function CreatePost() {
	const { id } = useParams();
	const [title, setTitle] = useState("");
	const [summary, setSummary] = useState("");
	const [content, setContent] = useState("");
	const [coverImage, setCoverImage] = useState(null);
	const [redirect, setRedirect] = useState(false);
	const [tags, setTags] = useState(["Code", "Web", "MERN", "SQL", "Other"]);
	const [activeTag, setActiveTag] = useState([]);
	const [aiPrompt, setAiPrompt] = useState("");
	const [aiImageURL, setAiImageURL] = useState("");
	const [includeAiImage, setIncludeAiImage] = useState(false);
	const [isGeneratingImage, setIsGeneratingImage] = useState(false);
	const [isLoadingContent, setIsLoadingContent] = useState(false);
	const [coverImagePreview, setCoverImagePreview] = useState(null);
	const [isListening, setIsListening] = useState(false);

	const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
	const lastTranscriptRef = useRef("");
	const contentRef = useRef("");

	useEffect(() => {
		if (!id) {
			return;
		} else {
			getPost();
		}
	}, [id]);

	async function getPost() {
		try {
			const response = await axios.get(`/post/${id}`);
			const postInfo = response.data;
			setTitle(postInfo.title);
			setSummary(postInfo.summary);
			setContent(postInfo.content);
			setActiveTag(postInfo.postTags);
			setCoverImagePreview(postInfo.cover);
		} catch (err) {
			console.log(err);
		}
	}

	const startListening = (ev) => {
		ev.preventDefault();
		if (!browserSupportsSpeechRecognition) {
			alert(
				"Your browser does not support speech recognition. Please use Chrome or Firefox."
			);
			return;
		}
		setIsListening(true);
		lastTranscriptRef.current = "";
		resetTranscript();
		SpeechRecognition.startListening({
			continuous: true,
			language: "en-IN",
		});
	};

	const stopListening = (ev) => {
		ev.preventDefault();
		setIsListening(false);
		lastTranscriptRef.current = "";
		SpeechRecognition.stopListening();
	};

	useEffect(() => {
		if (transcript) {
			const newContent = transcript
				.slice(lastTranscriptRef.current.length)
				.trim();
			if (newContent) {
				contentRef.current +=
					(contentRef.current ? " " : "") + newContent;
				setContent(contentRef.current);
			}
			lastTranscriptRef.current = transcript;
		}
	}, [transcript]);

	const onDrop = useCallback((acceptedFiles) => {
		const file = acceptedFiles[0];
		setCoverImage(file);

		const previewURL = URL.createObjectURL(file);
		setCoverImagePreview(previewURL);
	}, []);

	const generateImage = async () => {
		setIsGeneratingImage(true);
		try {
			const response = await axios.post("/ai/image", {
				prompt: aiPrompt,
			});

			setAiImageURL(response.data.imageUrl);
			setIncludeAiImage(false);
		} catch (error) {
			console.error("Error generating image:", error);
		} finally {
			setIsGeneratingImage(false);
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
		multiple: false,
	});

	async function createNewpost(ev) {
		ev.preventDefault();
		const data = new FormData();
		data.set("title", title);
		data.set("summary", summary);
		data.set("content", content);
		if (id) {
			data.set("id", id);
		}
		if (includeAiImage) {
			data.set("coverImageURL", aiImageURL);
		}
		if (coverImage) {
			data.set("file", coverImage);
		}
		if (activeTag.length === 0) {
			activeTag.push("Other");
		}
		data.append("postTags", activeTag);

		if (!id) {
			try {
				const response = await axios.post("/post", data);
				if (response.status === 200) {
					setRedirect(true);
				}
			} catch (err) {
				console.log(err);
			}
		} else {
			try {
				const response = await axios.put("/post", data);
				if (response.status === 200) {
					setRedirect(true);
				}
			} catch (err) {
				console.log(err);
			}
		}
	}

	const handlegenerateContent = async (ev) => {
		ev.preventDefault();
		setIsLoadingContent(true);
		try {
			const response = await axios.post("ai/content", JSON.stringify({ text: title }), {
				headers: {
					"Content-Type": "application/json",
				}
			});
			const data = response.data;
			const markedContent = marked(data.content);
			markedContent.replace("*", "");
			setTitle(data.title);
			setContent(markedContent);
			setSummary(data.summary);
		} catch (error) {
			console.error("Error generating Content:", error);
		} finally {
			setIsLoadingContent(false);
		}
	};

	if (redirect) {
		return <Navigate to="/" />;
	}

	return (
		<div className="max-w-5xl mx-auto mt-5 mb-16 p-6 px-10 bg-white shadow-md rounded-lg">
			<h2 className="text-2xl font-bold mb-6 text-gray-800">
				{!id ? <div>Create New Post</div> : <div>Edit Post</div>}
			</h2>
			<form onSubmit={createNewpost} className="space-y-6">
				<div>
					<label
						htmlFor="title"
						className="block text-sm font-medium text-gray-700"
					>
						Title
					</label>
					<div className="flex gap-[5px]">
						<input
							id="title"
							type="text"
							placeholder="Enter title for content generation"
							value={title}
							onChange={(ev) => setTitle(ev.target.value)}
							className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
						/>
						<button
							className="mt-1 w-auto bg-gray-700 text-white p-2 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:bg-gray-500"
							onClick={handlegenerateContent}
							disabled={isLoadingContent || !title.trim()}
						>
							{isLoadingContent ? "Generating..." : "Generate"}
						</button>
					</div>
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
						className={`mt-1 flex flex-col justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md ${
							isDragActive ? "bg-gray-100" : ""
						} cursor-pointer`}
					>
						<input {...getInputProps()} />
						{coverImagePreview ? (
							<div className="mb-4">
								<img
									src={coverImagePreview}
									alt="Cover Image Preview"
									className="max-w-full h-auto rounded-md shadow-md"
									style={{ maxHeight: "150px" }}
								/>
							</div>
						) : (
							<svg
								className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
						)}
						<div className="flex text-sm text-gray-600">
							<span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
								{coverImage ? "Change file" : "Upload a file"}
							</span>
							<p className="pl-1">or drag and drop</p>
						</div>
						<p className="text-xs text-gray-500 mt-2">
							PNG, JPG, GIF up to 10MB
						</p>
						{coverImage && (
							<p className="mt-2 text-sm text-gray-600">
								Selected file: {coverImage.name}
							</p>
						)}
					</div>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						AI Generated Image
					</label>
					<div className="flex gap-[5px]">
						<input
							className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
							value={aiPrompt}
							onChange={(ev) => setAiPrompt(ev.target.value)}
							placeholder="Enter a prompt for AI image generation"
						/>
						<button
							type="button"
							onClick={generateImage}
							disabled={isGeneratingImage || !aiPrompt.trim()}
							className="mt-1 w-auto bg-gray-700 text-white p-2 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:bg-gray-500"
						>
							{isGeneratingImage ? "Generating..." : "Generate"}
						</button>
					</div>
					{aiImageURL && (
						<div className="mt-4">
							<img
								src={aiImageURL}
								alt="AI Generated"
								className="rounded-md max-w-full h-auto"
							/>
							<div className="mt-2">
								<label className="inline-flex items-center">
									<input
										type="checkbox"
										checked={includeAiImage}
										onChange={(e) =>
											setIncludeAiImage(e.target.checked)
										}
										className="form-checkbox h-5 w-5 text-blue-600"
									/>
									<span className="ml-2 text-gray-700">
										Include this AI-generated image in the
										post
									</span>
								</label>
							</div>
						</div>
					)}
				</div>
				<div>
					<label
						htmlFor="content"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Content
					</label>
					<div className="flex gap-[5px] my-5">
						<button
							onClick={
								isListening ? stopListening : startListening
							}
							className={`px-4 py-2 rounded-md ${
								isListening
									? "bg-red-500 hover:bg-red-600 text-white"
									: "bg-gray-500 hover:bg-gray-900 text-white"
							}`}
						>
							{isListening ? "Stop Listening" : "Start Listening"}
						</button>
					</div>
					<Editor
						onChange={(value) => {
							setContent(value);
							contentRef.current = value;
						}}
						value={content}
					/>
				</div>
				<button
					type="submit"
					className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
				>
					{!id ? <div>Create</div> : <div>Edit </div>} <div>&nbsp; Post</div>
				</button>
			</form>
		</div>
	);
}

export default CreatePost;