const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
	{
		title: String,
		summary: String,
		content: String,
		cover: {
			type: String,
			default:
				"https://www.sylff.org/wp-content/uploads/2016/04/noImage.jpg",
		},
		postTags: [String],
		comments: [
			{
				user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
				content: String,
				createdAt: { type: Date, default: Date.now },
			},
		],
		likes: [
			{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
		],
		views: { type: Number, default: 0 },
		author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	},
	{
		timestamps: true,
	}
);

const PostModel = mongoose.model('Post', PostSchema);
module.exports = PostModel;