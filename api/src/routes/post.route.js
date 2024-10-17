const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
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
	handleGetPostsByProfileId
} = require("../controllers/post.controller");

const upload = require("../middlewares/multer.middleware");

router
	.route("/")
	.get(handleGetPosts)
	.post(upload.fields([{ name: "file", maxCount: 1 }]), handleAddPost)
	.put(
		upload.fields([{ name: "file", maxCount: 1 }]),
		handleUpdatePost
	);
router.route("/:id").get(handleGetPostById).delete(handleDeletePost);
router.route("/profile/:id").get(handleGetPostsByProfileId);
router.route("/:id/comment").post(handleAddComment);
router.route("/:id/like").post(handleToggleLike);
router.route("/:id/views").post(handleIncrementViews);
router.route("/:id/comment/:commentId").put(handleUpdateComment).delete(handleDeleteComment);

module.exports = router;
