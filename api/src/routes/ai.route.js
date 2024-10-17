const express = require("express");
const router = express.Router();

const { handleGetSummary, handleGetContent, handleGetImage } = require("../controllers/ai.controller");

router.route("/summary").post(handleGetSummary);
router.route("/content").post(handleGetContent);
router.route("/image").post(handleGetImage);

module.exports = router;