const express = require("express");
const router = express.Router();

const {
	handleRegisterUser,
	handleLoginUser,
	handleGetProfile,
	handleLogOut,
} = require("../controllers/user.controller");

router.route("/register").post(handleRegisterUser);
router.route("/login").post(handleLoginUser);
router.route("/profile").get(handleGetProfile);
router.route("/logout").post(handleLogOut);

module.exports = router;
