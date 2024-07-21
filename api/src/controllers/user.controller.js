const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const salt = bcrypt.genSaltSync(10);

const secret = "fuhcgiuhqb4e8b48e494n94s9b26326@%%^&#%#Y#FY#GJJ#J#";

const handleRegisterUser = async (req, res) => {
	const { username, password } = req.body;
	try {
		const userDoc = await User.create({
			username,
			password: bcrypt.hashSync(password, salt),
		});
		res.json(userDoc);
	} catch (err) {
		console.log(err);
		res.status(400).json(err);
	}
};

const handleLoginUser = async (req, res) => {
	const { username, password } = req.body;
	const userDoc = await User.findOne({ username });
	const passOk = bcrypt.compareSync(password, userDoc.password);
	if (passOk) {
		jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
			if (err) throw err;
			res.cookie("token", token).json({
				id: userDoc._id,
				username,
			});
		});
	} else {
		res.status(400).json("wrong credentials!");
	}
};

const handleGetProfile = (req, res) => {
	const { token } = req.cookies;
	jwt.verify(token, secret, {}, (err, info) => {
		if (err) throw err;
		res.json(info);
	});
};

const handleLogOut = (req, res) => {
	res.cookie("token", "").json("ok");
};

module.exports = {
	handleRegisterUser,
	handleLoginUser,
    handleGetProfile,
    handleLogOut
};
