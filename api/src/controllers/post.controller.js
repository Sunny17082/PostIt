const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Post = require("../models/post.model");

const fs = require("fs"); 

const salt = bcrypt.genSaltSync(10);

const secret = "fuhcgiuhqb4e8b48e494n94s9b26326@%%^&#%#Y#FY#GJJ#J#";

const tagOptions = ["Code", "Web", "MERN", "COBOL", "Other"];

const handleAddPost = async (req, res) => {
	const { originalname, path } = req.file;
	const parts = originalname.split(".");
	const ext = parts[parts.length - 1];
	const newPath = path + "." + ext;
	fs.renameSync(path, newPath);

	const { token } = req.cookies;
	jwt.verify(token, secret, {}, async (err, info) => {
		if (err) throw err;
		const { title, summary, content, postTags } = req.body;
		const postDoc = await Post.create({
			title,
			summary,
			content,
			postTags: postTags.split(","),
			cover: newPath,
			author: info.id,
		});
		res.json(postDoc);
	});
};

const handleGetPosts = async (req, res) => {
	const page_size = parseInt(req.query.select) || 3;
	const page = parseInt(req.query.page) - 1 || 0;
	const search = req.query.search || "";
	const sort = parseInt(req.query.sort) || -1;
	let tagPost = req.query.tagPost || "All";
	
	tagPost = tagPost === "All" ? [...tagOptions] : req.query.tagPost.split(",");

	const query = { title: { $regex: search, $options: "i" } };
	const total = await Post.countDocuments(query)
		.where("postTags")
		.in([...tagPost]);
	
	const postDoc = await Post.find(query)
		.populate("author", ["username"])
		.where("postTags")
		.in([...tagPost])
		.sort({ createdAt: sort })
		.limit(page_size)
		.skip(page_size * page);
	res.json({
		totalPages: Math.ceil(total / page_size),
		postDoc,
	});
};

const handleGetPostById = async (req, res) => {
	const { id } = req.params;
	const postDoc = await Post.findById(id).populate("author", ["username"]);
	res.json(postDoc);
};

const handleUpdatePost = async (req, res) => {
	let newPath = null;
	if (req.file) {
		const { originalname, path } = req.file;
		const parts = originalname.split(".");
		const ext = parts[parts.length - 1];
		newPath = path + "." + ext;
		fs.renameSync(path, newPath);
	}

	const { token } = req.cookies;
	jwt.verify(token, secret, {}, async (err, info) => {
		if (err) throw err;
		const { id, title, summary, content, postTags } = req.body;
		const postDoc = await Post.findById(id);
		const isAuthor =
			JSON.stringify(postDoc.author) === JSON.stringify(info.id);
		if (!isAuthor) {
			res.status(400).json("you are not an author");
		}
		await postDoc.updateOne({
			title,
			summary,
			content,
			postTags: postTags.split(","),
			cover: newPath ? newPath : postDoc.cover,
		});
		res.json(postDoc);
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

module.exports = {
    handleAddPost,
    handleGetPosts,
    handleGetPostById,
    handleUpdatePost,
    handleDeletePost
}