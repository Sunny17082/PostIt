const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose")
const app = express();
const User = require("./models/user");
const Post = require("./models/post");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");

const salt = bcrypt.genSaltSync(10);

const secret = "fuhcgiuhqb4e8b48e494n94s9b26326@%%^&#%#Y#FY#GJJ#J#";

const uploadMiddleware = multer({dest: 'uploads/'});

app.use(cors({credentials: true, origin: "http://localhost:3000"}));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname+"/uploads"));  

mongoose.connect("mongodb+srv://sunnyprasad1708:Sunny123456@cluster0.28fmslg.mongodb.net/?retryWrites=true&w=majority")
.then( () => console.log("Connection Successful..."))
.catch( (err) => console.log(err));

app.post("/register", async(req, res) => {
    const {username, password} = req.body;
    try {
        const userDoc = await User.create({
            username, 
            password:bcrypt.hashSync(password,salt)
        });
        res.json(userDoc);
    } catch(err) {
        console.log(err);
        res.status(400).json(err);
    }
});

app.post("/login", async(req, res) => {
    const {username, password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if(passOk) {
        jwt.sign({username, id:userDoc._id}, secret, {}, (err, token) => {
            if(err) throw err;
            res.cookie("token", token).json({
                id:userDoc._id,
                username
            });
        });
    } else {
        res.status(400).json("wrong credentials!");
    }
});

app.get("/profile", (req, res) => {
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err, info) => {
        if(err) throw err;
        res.json(info);
    });
});

app.post("/logout", (req, res) => {
    res.cookie("token", "").json("ok");
});

app.post("/post", uploadMiddleware.single('file'), async (req, res) => {
    const {originalname, path} = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length-1];
    const newPath = path+"."+ext;
    fs.renameSync(path, newPath);

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if(err) throw err;
        const {title, summary, content} = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id
        });
        res.json(postDoc);
    })
});

app.get("/post", async (req, res) => {
    res.json(await Post.find()
    .populate('author', ['username'])
    .sort({createdAt: -1})
    .limit(20)
    );
});

app.get("/post/:id", async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
});

app.put("/post", uploadMiddleware.single('file'), async (req, res) => {
    let newPath = null;
    if(req.file) {
        const {originalname, path} = req.file;
        const parts = originalname.split(".");
        const ext = parts[parts.length-1];
        newPath = path+"."+ext;
        fs.renameSync(path, newPath);
    }

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err, info) => {
        if(err) throw err;
        const {id, title, summary, content} = req.body;
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if(!isAuthor) {
            res.status(400).json("you are not an author");
        }
        await postDoc.updateOne({
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover 
        });
        res.json(postDoc);
    })
});

app.delete("/post/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await Post.findByIdAndDelete(id);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'An error occurred while deleting the post' });
    }
});

app.listen(5000, ()=> {
    console.log("Server started on port 5000...");
});