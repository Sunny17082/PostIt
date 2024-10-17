const jwt = require("jsonwebtoken");
const Post = require("../models/post.model");
const User = require("../models/user.model");

const { uploadOnCloudinary } = require("../utils/cloudinary");

const secret = process.env.JWT_SECRET;

const tagOptions = ["Code", "Web", "MERN", "SQL", "Other"];

const getUserIdFromToken = (req) => {
	const { token } = req.cookies;
	if (!token) return null;
	try {
		const user = jwt.verify(token, secret);
		return user.id;
	} catch (err) {
		return null;
	}
};

const handleAddPost = async (req, res) => {
	let newFile;
	if (req.files && req.files.file) {
		const fileImage = await uploadOnCloudinary(req.files.file[0].path);
		newFile = fileImage.url;
	}

	const { token } = req.cookies;
	jwt.verify(token, secret, {}, async (err, info) => {
		if (err) throw err;
		const { title, summary, content, postTags, coverImageURL } = req.body;
		const postDoc = await Post.create({
			title,
			summary,
			content,
			postTags: postTags?.split(","),
			cover: coverImageURL ? coverImageURL : newFile,
			author: info.id,
		});
		res.status(200).json(postDoc);
	});
};

const handleGetPosts = async (req, res) => {
	const page_size = parseInt(req.query.select) || 3;
	const page = parseInt(req.query.page) - 1 || 0;
	const search = req.query.search || "";
	const sort = parseInt(req.query.sort) || -1;
	let tagPost = req.query.tagPost || "All";
	const following = req.query.following || false;

	tagPost =
		tagPost === "All" ? [...tagOptions] : req.query.tagPost.split(",");

	const query = {
		title: { $regex: search, $options: "i" },
	};

	try {
		const userId = getUserIdFromToken(req);
		if (!userId && following === "true") {
			return res.json({
				totalPages: 0,
				postDoc: [],
			});
		}

		if (userId) {
			const user = await User.findById(userId);
			if (user) {
				if (following === "true" && user.following.length === 0) {
					return res.json({
						totalPages: 0,
						postDoc: [],
					});
				}
				if (following === "true" && user.following.length > 0) {
					query.author = { $in: [...user.following, userId] };
				}
			}
		}

		const total = await Post.countDocuments(query)
			.where("postTags")
			.in([...tagPost]);

		const postDoc = await Post.find(query)
			.populate("author", ["_id", "username", "name"])
			.where("postTags")
			.in([...tagPost])
			.sort({ createdAt: sort })
			.limit(page_size)
			.skip(page_size * page);
		res.json({
			totalPages: Math.ceil(total / page_size),
			postDoc,
		});
	} catch (err) {
		console.log(err);
		res.status(500).json(err);
	}
};

const handleGetPostsByProfileId = async (req, res) => {
	const profileId = req.params.id;
	const author = await User.findById(profileId).select("-password");
	const postDoc = await Post.find({ author: profileId }).sort({
		createdAt: -1,
	});
	res.json({ author, postDoc });
};

const handleGetPostById = async (req, res) => {
	const { id } = req.params;
	const postDoc = await Post.findById(id)
		.populate("author", ["_id", "username", "name"])
		.populate("comments.user", [
			"_id",
			"username",
			"name",
			"profileImg",
			"followers",
		]);
	res.json(postDoc);
};

const handleUpdatePost = async (req, res) => {
	let newFile;
	if (req.files && req.files.file) {
		const fileImage = await uploadOnCloudinary(req.files.file[0].path);
		newFile = fileImage.url;
	}

	const { token } = req.cookies;

	jwt.verify(token, secret, {}, async (err, info) => {
		if (err) throw err;
		const { id, title, summary, content, postTags, coverImageURL } = req.body;
		const postDoc = await Post.findById(id);
		const isAuthor =
			JSON.stringify(postDoc.author) === JSON.stringify(info.id);
		if (!isAuthor) {
			res.status(400).json("you are not an author");
		}
		if (coverImageURL) {
			newFile = coverImageURL;
		}
		await postDoc.updateOne({
			title,
			summary,
			content,
			postTags: postTags.split(","),
			cover: newFile ? newFile : postDoc.cover,
		});
		res.status(200).json(postDoc);
	});
};

const handleDeletePost = async (req, res) => {
	const { id } = req.params;
	try {
		await Post.findByIdAndDelete(id);
		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.error("Error deleting post:", error);
		res.status(500).json({
			error: "An error occurred while deleting the post",
		});
	}
};

const handleAddComment = (req, res) => {
	const { id } = req.params;
	const { content } = req.body;
	const { token } = req.cookies;

	jwt.verify(token, secret, {}, async (err, user) => {
		if (err) throw err;
		try {
			const postDoc = await Post.findById(id);
			postDoc.comments.push({
				user: user.id,
				content,
			});
			await postDoc.save();
			res.status(200).json(postDoc);
		} catch (err) {
			res.status(500).json(err);
		}
	});
};

const handleToggleLike = (req, res) => {
	const { id } = req.params;
	const { token } = req.cookies;

	jwt.verify(token, secret, {}, async (err, user) => {
		if (err) throw err;
		try {
			const postDoc = await Post.findById(id);
			const userIndex = postDoc.likes.indexOf(user.id);
			if (userIndex === -1) {
				postDoc.likes.push(user.id);
			} else {
				postDoc.likes.splice(userIndex, 1);
			}
			await postDoc.save();
			res.json(postDoc);
		} catch (err) {
			res.json(err);
		}
	});
};

const handleIncrementViews = async (req, res) => {
	const { id } = req.params;
	try {
		const postDoc = await Post.findById(id);
		postDoc.views += 1;
		await postDoc.save();
		res.json(postDoc);
	} catch (err) {
		res.json(err);
	}
};

const handleUpdateComment = (req, res) => {
	const { id, commentId } = req.params;
	const { content } = req.body;
	const { token } = req.cookies;

	jwt.verify(token, secret, {}, async (err, user) => {
		if (err) throw err;
		try {
			const postDoc = await Post.findById(id);
			const comment = postDoc.comments.id(commentId);

			comment.content = content;
			await postDoc.save();
			res.json(postDoc);
		} catch (err) {
			res.json(err);
		}
	});
};

const handleDeleteComment = (req, res) => {
	const { id, commentId } = req.params;
	const { token } = req.cookies;

	jwt.verify(token, secret, {}, async (err, user) => {
		if (err) throw err;
		try {
			const postDoc = await Post.findById(id);
			const comment = postDoc.comments.id(commentId);
			const commentIndex = postDoc.comments.indexOf(comment);
			postDoc.comments.splice(commentIndex, 1);
			await postDoc.save();
			console.log(postDoc);
			res.json(postDoc);
		} catch (err) {
			console.log(err);
			res.json(err);
		}
	});
};

module.exports = {
	handleAddPost,
	handleGetPosts,
	handleGetPostById,
	handleUpdatePost,
	handleDeletePost,
	handleAddComment,
	handleUpdateComment,
	handleDeleteComment,
	handleToggleLike,
	handleIncrementViews,
	handleGetPostsByProfileId,
};
