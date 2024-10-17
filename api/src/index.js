const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const morgan = require("morgan");
const app = express();
const cookieParser = require("cookie-parser");
const { connectDB } = require("./db/connection");
const userRouter = require("./routes/user.route");
const postRouter = require("./routes/post.route");
const aiRouter = require("./routes/ai.route");

const path = require("path");

const PORT = process.env.PORT || 8000;

app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("tiny"));
app.use("/uploads", express.static(__dirname + "/uploads"));

connectDB().then(() => {
		console.log("connected to database...");
	})
	.catch((err) => {
		console.log(err.message);
	});

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/ai", aiRouter);

app.listen(5000, () => {
	console.log("Server started on port 5000...");
});