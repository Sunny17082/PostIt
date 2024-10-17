const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
	},
	password: {
		type: String,
	},
	googleId: {
		type: String,
	},
	email: {
		type: String,
	},
	bio: {
		type: String,
		default: "Passionate coder and tech enthusiast",
	},
	profileImg: {
		type: String,
		default:
			"https://www.freeiconspng.com/uploads/msn-people-person-profile-user-icon--icon-search-engine-16.png",
	},
	coverImg: {
		type: String,
		default:
			"https://cdn.pixabay.com/photo/2015/07/28/22/01/office-865091_640.jpg",
	},
	followers: {
		type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		default: [],
	},
	following: {
		type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		default: [],
	},
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;