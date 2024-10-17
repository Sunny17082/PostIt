const express = require("express");
const router = express.Router();

const {
	handleRegisterUser,
	handleLoginUser,
	handleGoogleLogin,
	handleGoogleCallback,
	handleGetProfile,
	handleGetProfileById,
	handleFollowUser,
	handleGetFollowers,
	handleGetFollowing,
	handleGetUserInfo,
	handleUpdateUserInfo,
	handleLogOut,
} = require("../controllers/user.controller");

const upload = require("../middlewares/multer.middleware");



router.route("/register").post(handleRegisterUser);
router.route("/login").post(handleLoginUser);
router.route("/profile").get(handleGetProfile);
router.route("/logout").post(handleLogOut);
router.route("/google").get(handleGoogleLogin);
router.route("/google/callback").get(handleGoogleCallback);
router.route("/profile/:id").get(handleGetProfileById);
router.route("/follow/:id").post(handleFollowUser);
router.route("/followers/:id").get(handleGetFollowers);
router.route("/following/:id").get(handleGetFollowing);
router
	.route("/")
	.get(handleGetUserInfo)
	.put(
		upload.fields([
			{ name: "profileImg", maxCount: 1 },
			{ name: "coverImg", maxCount: 1 },
		]),
		handleUpdateUserInfo
	);

module.exports = router;
