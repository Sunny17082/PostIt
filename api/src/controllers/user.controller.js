const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const passport = require("passport");
const { connectDB } = require("../db/connection");
const { body, validationResult } = require("express-validator");

const { uploadOnCloudinary } = require("../utils/cloudinary");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const salt = bcrypt.genSaltSync(10);

const secret = process.env.JWT_SECRET;

const validateUserRegistration = [
	body("username")
		.isLength({ min: 3, max: 30 })
		.withMessage("Username must be between 3 and 30 characters long")
		.isAlphanumeric()
		.withMessage("Username must contain only letters and numbers"),
	body("name")
		.isLength({ min: 2, max: 15 })
		.withMessage("Name must be between 2 and 15 characters long"),
	body("password")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters long")
		.matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
		.withMessage(
			"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
		),
];

// Google OAuth configuration

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
		},
		async function (accessToken, refreshToken, profile, done) {
			try {
				connectDB()
					.then(() => {
						console.log("connected to database...");
					})
					.catch((err) => {
						console.log(err.message);
					});
				let user = await User.findOne({ googleId: profile.id });
				if (!user) {
					user = await User.create({
						googleId: profile.id,
						username: profile.emails[0].value.split("@")[0],
						name: profile.displayName,
						profileImg: profile.photos[0].value,
						email: profile.emails[0].value,
					});
				}
				return done(null, user);
			} catch (err) {
				return done(err, null);
			}
		}
	)
);

const handleRegisterUser = async (req, res) => {
	await Promise.all(
		validateUserRegistration.map((validation) => validation.run(req))
	);

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { username, name, password } = req.body;
	try {
		const userDoc = await User.create({
			username,
			name,
			password: bcrypt.hashSync(password, salt),
		});
		res.status(200).json(userDoc);
	} catch (err) {
		console.log(err);
		res.status(400).json(err);
	}
};

const handleLoginUser = async (req, res) => {
	const { username, password } = req.body;
	const userDoc = await User.findOne({ username });
	if (!userDoc) {
		return res.status(400).json({ "path": "username", "msg": "No user exists with that username"});
	}
	const passOk = bcrypt.compareSync(password, userDoc.password);
	if (passOk) {
		jwt.sign(
			{ username, name: userDoc.name, id: userDoc._id },
			secret,
			{},
			(err, token) => {
				if (err) throw err;
				res.cookie("token", token).json({
					id: userDoc._id,
					username,
					name: userDoc.name,
				});
			}
		);
	} else {
		res.status(400).json({"path": "password", "msg": "wrong password"});
	}
};

const handleGoogleLogin = passport.authenticate("google", {
	scope: ["profile", "email"],
});

const handleGoogleCallback = (req, res, next) => {
	passport.authenticate("google", { session: false }, (err, user) => {
		if (err || !user) {
			return res.status(400).json({ error: err });
		}

		const token = jwt.sign(
			{
				id: user._id,
				username: user.username,
				name: user.name,
			},
			secret,
			{}
		);

		res.cookie("token", token).redirect(process.env.CLIENT_URL);
	})(req, res, next);
};

const handleGetProfile = (req, res) => {
	const { token } = req.cookies;
	if (token || token !== "") {
		jwt.verify(token, secret, {}, (err, info) => {
			if (err) throw err;
			res.status(200).json(info);
		});
	}
};

const handleGetProfileById = async (req, res) => {
	const { id } = req.params;
	const userDoc = await User.findById(id);
	res.status(200).json(userDoc);
};

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

const handleFollowUser = async (req, res) => {
	const { id } = req.params;
	const loggedInUserId = getUserIdFromToken(req);
	if (!loggedInUserId) {
		res.status(401).json("unauthorized");
	}
	try {
		const userToFollow = await User.findById(id);
		const loggedInUser = await User.findById(loggedInUserId);
		if (!userToFollow || !loggedInUser) {
			res.status(404).json("user not found");
		}

		if (!userToFollow.followers.includes(loggedInUserId)) {
			await userToFollow.updateOne({
				$push: { followers: loggedInUserId },
			});
			await loggedInUser.updateOne({ $push: { following: id } });
			res.status(200).json("followed");
		} else {
			await userToFollow.updateOne({
				$pull: { followers: loggedInUserId },
			});
			await loggedInUser.updateOne({ $pull: { following: id } });
			res.status(200).json("unfollowed");
		}
	} catch (err) {
		res.status(500).json(err);
	}
};

const handleGetFollowers = async (req, res) => {
	const { id } = req.params;
	try {
		const userDoc = await User.findById(id).populate(
			"followers",
			"username name profileImg"
		);
		res.status(200).json(userDoc.followers);
	} catch (err) {
		res.status(500).json(err);
	}
};

const handleGetFollowing = async (req, res) => {
	const { id } = req.params;
	try {
		const userDoc = await User.findById(id).populate(
			"following",
			"username name profileImg"
		);
		res.status(200).json(userDoc.following);
	} catch (err) {
		res.status(500).json(err);
	}
};

const handleLogOut = (req, res) => {
	res.cookie("token", "").json("ok");
};

const handleGetUserInfo = async (req, res) => {
	const userId = getUserIdFromToken(req);
	if (!userId) {
		res.status(401).json("unauthorized");
	}
	try {
		const user = await User.findById(userId).select("-password -googleId");
		res.json(user);
	} catch (err) {
		res.status(500).json(err);
	}
};

const handleUpdateUserInfo = async (req, res) => {
	const userId = getUserIdFromToken(req);
	if (!userId) {
		return res.status(401).json("unauthorized");
	}
	const { name, bio, oldPassword, newPassword } = req.body;

	try {
		const user = await User.findById(userId);

		if (newPassword) {
			if (user.password) {
				if (!oldPassword) {
					res.status(400).json(
						"old password is required for changing password of existing account"
					);
				}
				const isPasswordCorrect = bcrypt.compareSync(
					oldPassword,
					user.password
				);
				if (!isPasswordCorrect) {
					res.status(400).json("incorrect password");
				}
			}
			user.password = bcrypt.hashSync(newPassword, salt);
		}

		if (bio) {
			user.bio = bio;
		}

		if (name) {
			user.name = name;
		}

		if (req.files) {
			if (req.files.profileImg) {
				const profileImage = await uploadOnCloudinary(
					req.files.profileImg[0].path
				);
				user.profileImg = profileImage.url;
			}
			if (req.files.coverImg) {
				const coverImage = await uploadOnCloudinary(
					req.files.coverImg[0].path
				);
				user.coverImg = coverImage.url;
			}
		}

		const updatedUser = await user.save();
		res.json({
			id: updatedUser._id,
			name: updatedUser.name,
			bio: updatedUser.bio,
			profileImg: updatedUser.profileImg,
			coverImg: updatedUser.coverImg,
		});
	} catch (err) {
		res.json(err);
	}
};

module.exports = {
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
};
