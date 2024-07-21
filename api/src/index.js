const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();
const cookieParser = require("cookie-parser");
const { connectDB } = require("./db/connection");
const userRouter = require("./routes/user.route");
const postRouter = require("./routes/post.route");
const path = require("path");

const PORT = process.env.PORT || 8000;

app.use(cors({credentials: true, origin: "http://localhost:3000"}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("tiny"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

connectDB(process.env.MONGO_URI).then(() => {
    console.log("connected to database...");
}).catch((err) => {
    console.log(err.message);
});

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);

app.listen(5000, ()=> {
    console.log("Server started on port 5000...");
});