import React, { useContext, useState, useMemo, useEffect } from "react";
import { UserContext } from "../UserContext";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ProfilePage = () => {
	const { userInfo } = useContext(UserContext);
	const [searchTerm, setSearchTerm] = useState("");
	const { id } = useParams();
	const [profileData, setProfileData] = useState({});
	const [posts, setPosts] = useState([]);
	const [followers, setFollowers] = useState([]);
	const [following, setFollowing] = useState([]);
	const [isFollowing, setIsFollowing] = useState(false);

	const navigate = useNavigate();

	const isOwnProfile = userInfo?.id === id;

	const getUserProfile = async () => {
		try {
			const response = await axios.get(`/post/profile/${id}`);
			const data = response.data;
			setProfileData(data.author);
			setPosts(data.postDoc);
			setFollowers(data.author.followers);
			setFollowing(data.author.following);
			setIsFollowing(data.author.followers.includes(userInfo?.id));
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {
		getUserProfile();
	}, [userInfo]);

	const handleFollow = async () => {
		if (!userInfo) {
			alert("Please login to follow this user");
			return navigate("/login");
		}
		try {
			const response = await axios.post(`/user/follow/${id}`);
			if (response.status === 200) {
				!isFollowing
					? setFollowers([...followers, userInfo.id])
					: setFollowers(
							followers.filter(
								(followerId) => followerId !== userInfo.id
							)
					  );
				setIsFollowing(!isFollowing);
			}
		} catch (err) {
			console.log(err);
		}
	};

	const filteredAndSortedPosts = useMemo(() => {
		return posts
			.filter((post) =>
				post?.title?.toLowerCase().includes(searchTerm.toLowerCase())
			)
	}, [posts, searchTerm]);

	if (!profileData) {
		return <div>Loading...</div>;
	}

	return (
		<div className="bg-gray-100 min-h-screen">
			<div className="max-w-3xl mx-auto px-4 py-8">
				<div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
					<div
						className="relative h-48 bg-cover bg-center"
						style={{
							backgroundImage: `url(${profileData.coverImg})`,
						}}
					>
						<div className="absolute inset-0 bg-black opacity-30"></div>
					</div>
					<div className="relative px-6 pt-0 pb-6">
						<div className="absolute left-6 -top-16">
							<img
								className="w-32 h-32 rounded-full border-4 border-white bg-gray-500 object-cover"
								src={profileData.profileImg}
								alt={profileData.username}
							/>
						</div>
						{isOwnProfile && (
							<Link
								to="/settings"
								className="bg-[#f0f1f3] p-[10px] rounded-full absolute right-10 top-5"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className="size-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
									/>
								</svg>
							</Link>
						)}
						<div className="pt-20 sm:pt-5 sm:pl-[9.5rem]">
							<h1 className="text-2xl font-bold text-gray-900">
								{profileData.name}
							</h1>
							<p className="text-gray-600">
								@{profileData.username}
							</p>
							<p className="text-gray-700 mt-2 mb-4">
								{profileData.bio}
							</p>
							<div className="flex flex-wrap gap-6 mb-4">
								<div className="text-center">
									<span className="block font-bold text-xl text-gray-900">
										{posts.length}
									</span>
									<span className="text-sm text-gray-600">
										Posts
									</span>
								</div>
								<div className="text-center">
									<span className="block font-bold text-xl text-gray-900">
										{followers.length}
									</span>
									<span className="text-sm text-gray-600">
										Followers
									</span>
								</div>
								<div className="text-center">
									<span className="block font-bold text-xl text-gray-900">
										{posts.reduce(
											(totalLikes, post) =>
												totalLikes + post.likes.length,
											0
										)}
									</span>
									<span className="text-sm text-gray-600">
										Likes
									</span>
								</div>
								{isOwnProfile && (
									<div className="text-center">
										<span className="block font-bold text-xl text-gray-900">
											{following.length}
										</span>
										<span className="text-sm text-gray-600">
											Following
										</span>
									</div>
								)}
							</div>
							{!isOwnProfile && (
								<button
									className="w-full sm:w-auto bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition duration-300"
									onClick={handleFollow}
								>
									{!isFollowing ? "Follow" : "Unfollow"}
								</button>
							)}
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-md p-6 mb-8">
					<div className="flex flex-col sm:flex-row gap-4 mb-6">
						<input
							type="text"
							placeholder="Search posts..."
							className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					<div className="space-y-6">
						{filteredAndSortedPosts.map((post) => (
							<div
								key={post._id}
								className="border-b border-gray-200 pb-6 last:border-b-0"
							>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									{post.title}
								</h3>
								<p className="text-gray-700 mb-3">
									{post.summary}
								</p>
								<div className="flex justify-between text-sm text-gray-500">
									<span>
										{post.likes.length} likes •{" "}
										{post.comments.length} comments
									</span>
									<Link
										to={`/post/${post._id}`}
										className="text-gray-900 hover:text-gray-700 font-medium"
									>
										Read more
									</Link>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
