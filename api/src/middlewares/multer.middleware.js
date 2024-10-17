const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "/tmp");
	},
	filename: function (req, file, cb) {
		cb(null, uuidv4() + Date.now() + ".png");
	},
});

const upload = multer({ storage: storage });

module.exports = upload;
