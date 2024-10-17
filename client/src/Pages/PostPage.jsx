import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from "../UserContext";
import { marked } from "marked";
import axios from "axios";

function PostPage() {
	const [postInfo, setPostInfo] = useState(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const { userInfo } = useContext(UserContext);
	const { id } = useParams();
	const [summary, setSummary] = useState("");
	const [isLoadingSummary, setIsLoadingSummary] = useState(false);
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState("");
	const [likes, setLikes] = useState(0);
	const [views, setViews] = useState(0);
	const [isLiked, setIsLiked] = useState(false);
	const [editingCommentId, setEditingCommentId] = useState(null);
	const [editedCommentContent, setEditedCommentContent] = useState("");
	const [isCommentChanged, setIsCommentChanged] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const utteranceRef = useRef(null);
	const speechSynthesis = window.speechSynthesis;

	const navigate = useNavigate();

	const getPost = async () => {
		try {
			const response = await axios.get(`/post/${id}`);
			const postInfo = response.data;
			setPostInfo(postInfo);
			setComments(postInfo.comments);
			setLikes(postInfo.likes.length);
			setViews(postInfo.views);
			setIsLiked(postInfo.likes.includes(userInfo.id));
		} catch (err) {
			console.error("Error fetching post:", err);
		}
	};

	const getViews = async () => {
		try {
			await axios.post(`/post/${id}/views`, {
				withCredentials: true,
			});
		} catch (err) {
			console.error("Error updating views:", err);
		}
	}

	useEffect(() => {
		getPost();
		setIsCommentChanged(false);
	}, [id, isCommentChanged]);
	
	useEffect(() => {
		getViews();
	}, [id]);

	const stripHtml = (html) => {
		const tmp = document.createElement("DIV");
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || "";
	};

	const speakContent = () => {
		if (!utteranceRef.current) {
			const cleanContent = stripHtml(postInfo.content);
			utteranceRef.current = new SpeechSynthesisUtterance(cleanContent);
			utteranceRef.current.onend = () => setIsSpeaking(false);
		}

		if (!isSpeaking) {
			speechSynthesis.cancel();
			utteranceRef.current.lang = "en-IN";
			speechSynthesis.speak(utteranceRef.current);
			setIsSpeaking(true);
		} else {
			speechSynthesis.pause();
			setIsSpeaking(false);
		}
	};

	useEffect(() => {
		return () => {
			if (utteranceRef.current) {
				speechSynthesis.cancel();
			}
		};
	}, []);

	if (!postInfo) {
		return (
			<div className="flex justify-center items-center h-screen text-gray-600">
				Loading...
			</div>
		);
	}

	const handleSummary = async (ev) => {
		ev.preventDefault();
		setIsLoadingSummary(true);
		try {
			const response = await axios.post("ai/summary", JSON.stringify({ text: postInfo.content }), {
				headers: {
					"Content-Type": "application/json",
				}
			});
			const data = response.data;
			const markedSummary = marked(data.summary);
			setSummary(markedSummary);
		} catch (error) {
			console.error("Error generating summary:", error);
		} finally {
			setIsLoadingSummary(false);
		}
	};

	const handleDelete = async () => {
		try {
			const response = await axios.delete(`/post/${postInfo._id}`);
			navigate("/");
		} catch (err) {
			console.error("Error deleting post:", err);
		}
	};

	const handleAddComment = async (ev) => {
		ev.preventDefault();
		if (!userInfo?.id) {
			alert("Please login to post a comment");
			return navigate("/login");
		}
		if (newComment.trim() === "") {
			alert("Please enter a comment to post");
			return;
		}
		try {
			const response = await axios.post(`post/${postInfo._id}/comment`, JSON.stringify({ content: newComment }),{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
			const data = response.data;
			setComments(data.comments);
			setNewComment("");
			setIsCommentChanged(true);
		} catch (error) {
			console.error("Error adding comment:", error);
		}
	};

	const handleToggleLike = async () => {
		if (!userInfo?.id) {
			alert("Please login to like this post");
			return navigate("/login");
		}
		try {
			const response = await axios.post(`/post/${postInfo._id}/like`);
			const data = response.data;
			setLikes(data.likes.length);
			setIsLiked(data && data.likes && data.likes.includes(userInfo.id));
		} catch (error) {
			console.error("Error toggling like:", error);
		}
	};

	const handleEditComment = (id, content) => {
		setEditingCommentId(id);
		setEditedCommentContent(content);
	}

	const handleUpdateComment = async (commentId) => {
		try {
			const response = await axios.put(`/post/${postInfo._id}/comment/${commentId}`, JSON.stringify({ content: editedCommentContent }), {
				headers: {
					"Content-Type": "application/json",
				}
			});
			const data = response.data;
			setComments(data.comments);
			setEditingCommentId(null);
			setEditedCommentContent("");
			setIsCommentChanged(true);
		} catch (err) {
			console.log(err);
		}
	}

	const handleDeleteComment = async (commentId) => {
		try {
			const response = await axios.delete(`/post/${postInfo._id}/comment/${commentId}`);
			const data = response.data;
			setComments(data.comments);
			setIsCommentChanged(true);
		} catch (err) {
			console.log(err);
		}
	}

	const handleShare = () => {
		if (navigator.share) {
			navigator
				.share({
					title: postInfo.title,
					text: "Check out this post!",
					url: window.location.href,
				})
				.then(() => console.log("Successful share"))
				.catch((error) => console.log("Error sharing", error));
		} else {
			const url = window.location.href;
			navigator.clipboard.writeText(url).then(() => {
				alert("Link copied to clipboard!");
			});
		}
	};

	return (
		<div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
			<article className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
				<img
					src={postInfo.cover}
					alt={postInfo.title}
					className="w-full sm:h-80 object-cover object-center"
				/>
				<div className="p-8">
					<h1 className="text-4xl font-bold mb-6 text-center text-gray-900">
						{postInfo.title}
					</h1>
					<div className="flex justify-center items-center gap-[10px] mb-8 text-gray-600">
						<time className="text-[10px] sm:text-sm flex items-center">
							<svg
								className="w-3 h-3 sm:w-5 sm:h-4 mr-2"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
									clipRule="evenodd"
								/>
							</svg>
							{formatISO9075(new Date(postInfo.createdAt))}
						</time>
						<Link
							to={`/profile/${postInfo.author._id}`}
							className="text-[10px] sm:text-sm flex items-center"
						>
							<svg
								className="w-3 h-3 sm:w-5 sm:h-4 mr-2"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
									clipRule="evenodd"
								/>
							</svg>
							{postInfo.author.name}
						</Link>
					</div>
					{userInfo.id === postInfo.author._id && (
						<div className="flex justify-center space-x-4 mb-8">
							<Link
								className="flex items-center px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition duration-300"
								to={`/create/${postInfo._id}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									className="w-5 h-5 mr-2"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
									/>
								</svg>
								Edit
							</Link>
							<button
								className="flex items-center px-6 py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition duration-300"
								onClick={() => setShowDeleteModal(true)}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									className="w-5 h-5 mr-2"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M6 18 18 6M6 6l12 12"
									/>
								</svg>
								Delete
							</button>
						</div>
					)}
					<div className="flex items-center gap-3 mb-5 px-[5px] sm:px-[15px]">
						<button
							onClick={handleToggleLike}
							className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
						>
							{!isLiked ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className="size-5"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
									/>
								</svg>
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="size-5"
								>
									<path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
								</svg>
							)}
							{likes}
						</button>
						<span className="text-gray-600 flex items-center">
							<svg
								className="w-5 h-5 mr-1"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
								<path
									fillRule="evenodd"
									d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
									clipRule="evenodd"
								/>
							</svg>
							{views}
						</span>
						<button
							onClick={speakContent}
							className="flex items-center gap-[5px] text-gray-600 hover:text-gray-900"
						>
							{isSpeaking ? (
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
										d="M15.75 5.25v13.5m-7.5-13.5v13.5"
									/>
								</svg>
							) : (
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
										d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653z"
									/>
								</svg>
							)}
							{isSpeaking ? "Pause" : "Play"}
						</button>
						<button
							onClick={handleShare}
							className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-5"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
								/>
							</svg>
							Share
						</button>
					</div>
					{postInfo.content.length > 135 && (
						<div className="mb-8">
							<button
								className="w-full text-center py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition duration-300 disabled:opacity-50"
								onClick={handleSummary}
								disabled={isLoadingSummary}
							>
								{isLoadingSummary ? (
									<span className="flex items-center justify-center">
										<svg
											className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Generating Summary...
									</span>
								) : (
									"Generate Summary"
								)}
							</button>
							{summary && (
								<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 p-5 bg-[#1f2937] text-white rounded-lg">
									<h3 className="text-lg font-semibold mb-2">
										Summary
									</h3>
									<p
										className="prose prose-sm lg:prose-base"
										style={{
											fontSize: "clamp(14px, 1vw, 19px)",
											lineHeight: "1.9",
										}}
										dangerouslySetInnerHTML={{
											__html: summary,
										}}
									/>
								</div>
							)}
						</div>
					)}
					<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-10">
						<div
							className="prose prose-sm lg:prose-base text-gray-800"
							style={{
								fontSize: "clamp(14px, 1vw, 19px)",
								lineHeight: "1.9",
							}}
							dangerouslySetInnerHTML={{
								__html: postInfo.content,
							}}
						/>
					</div>

					<div className="mt-6">
						<h3 className="text-2xl font-semibold mb-5 text-gray-900">
							Comments
						</h3>

						<form onSubmit={handleAddComment} className="mb-8">
							<textarea
								value={newComment}
								onChange={(ev) =>
									setNewComment(ev.target.value)
								}
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent"
								placeholder="Add a comment..."
								rows="3"
							></textarea>
							<button
								type="submit"
								className="mt-3 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition duration-300"
							>
								Post Comment
							</button>
						</form>
						<div className="mb-3 px-2">
							{comments.length} comments
						</div>
						{comments.map((comment, index) => (
							<div
								key={index}
								className="mb-6 p-5 bg-white rounded-lg shadow-sm border border-gray-200"
							>
								<div className="flex items-start gap-3">
									<Link to={`/profile/${comment.user._id}`}>
										<img
											src={comment.user.profileImg}
											alt={comment.user.name}
											className="w-10 h-10 basis-5 rounded-full object-cover border border-gray-300 flex-shrink-0"
										/>
									</Link>
									<div className="flex-grow basis-5">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Link
													to={`/profile/${comment.user._id}`}
													className="font-semibold text-gray-900 text-sm"
												>
													{comment.user.name}
												</Link>
												{comment.user._id ===
													postInfo.author._id && (
													<span className="px-2 py-1 bg-gray-200 text-gray-700 text-[10px] font-semibold rounded-full">
														Author
													</span>
												)}
											</div>
											{userInfo.id ===
												comment.user._id && (
												<div className="flex items-center gap-[5px]">
													<button
														onClick={() =>
															handleEditComment(
																comment._id,
																comment.content
															)
														}
														className="text-gray-600 hover:text-gray-800 transition duration-200"
														aria-label="Edit comment"
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
															strokeWidth={1.5}
															stroke="currentColor"
															className="w-5 h-5"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
															/>
														</svg>
													</button>
													<button
														onClick={() =>
															handleDeleteComment(
																comment._id
															)
														}
														className="text-gray-600 hover:text-gray-800 transition duration-200"
														aria-label="Delete comment"
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
															strokeWidth={1.5}
															stroke="currentColor"
															className="w-5 h-5"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
															/>
														</svg>
													</button>
												</div>
											)}
										</div>
										<div className="flex items-center gap-2 text-xs text-gray-500">
											<Link
												to={`/profile/${comment.user._id}`}
											>
												@{comment.user.username}
											</Link>
											<span className="hidden sm:block">•</span>
											<span className="hidden sm:block">
												{
													comment.user?.followers
														?.length
												}{" "}
												followers
											</span>
										</div>
										<p className="text-[10px] text-gray-900">
											{formatISO9075(
												new Date(comment.createdAt)
											)}
										</p>
										{editingCommentId !== comment._id && (
											<p className="text-gray-700 text-sm">
												{comment.content}
											</p>
										)}
									</div>
								</div>
								{editingCommentId === comment._id && (
									<div className="mt-3">
										<textarea
											value={editedCommentContent}
											onChange={(e) =>
												setEditedCommentContent(
													e.target.value
												)
											}
											className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-400 focus:border-transparent"
										/>
										<div className="flex gap-3 mt-2">
											<button
												onClick={() =>
													setEditingCommentId(null)
												}
												className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition duration-200"
											>
												Cancel
											</button>
											<button
												onClick={() =>
													handleUpdateComment(
														comment._id
													)
												}
												className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition duration-200"
											>
												Save
											</button>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</article>

			{showDeleteModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
					<div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
						<h2 className="text-2xl font-bold mb-4 text-gray-900">
							Confirm Deletion
						</h2>
						<p className="mb-6 text-gray-700">
							Are you sure you want to delete this post? This
							action cannot be undone.
						</p>
						<div className="flex justify-end space-x-4">
							<button
								className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-300"
								onClick={() => setShowDeleteModal(false)}
							>
								Cancel
							</button>
							<button
								className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition duration-300"
								onClick={handleDelete}
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default PostPage;
