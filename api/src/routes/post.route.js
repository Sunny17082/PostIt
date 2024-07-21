const express = require("express");
const multer = require("multer");
const router = express.Router();
const uploadMiddleware = multer({ dest: "uploads/" });

const {
	handleAddPost,
	handleGetPosts,
	handleGetPostById,
	handleUpdatePost,
	handleDeletePost,
} = require("../controllers/post.controller");

router
	.route("/")
	.get(handleGetPosts)
	.post(uploadMiddleware.single("file"), handleAddPost)
	.put(uploadMiddleware.single("file"), handleUpdatePost);
router.route("/:id").get(handleGetPostById).delete(handleDeletePost);

module.exports = router;
