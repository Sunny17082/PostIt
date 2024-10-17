const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const path = require("path");
const fs = require("fs");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const handleGetSummary = async (req, res) => {
	try {
		const { text } = req.body;
		if (!text) {
			res.status(400).json({ error: "Text is required" });
		}

		const result = await model.generateContent(
			`Please summarize the following text ignore any html:\n${text}`
		);
		const summary = result.response.text();

		res.json({ summary });
	} catch (error) {
		console.error("Gemini API Error:", error);
		res.status(500).json({ error: error.message });
	}
};

const handleGetContent = async (req, res) => {
	try {
		const { text } = req.body;
		if (!text) {
			res.status(400).json({ error: "Text is required" });
			return;
		}

		const prompt = `Generate a blog post on the topic: "${text}"
		Provide the response in the following JSON format, and ONLY this format:
		{
			"title": "A catchy title for the blog post",
			"content": "The main body of the blog post",
			"summary": "A one-sentence summary of the blog post"
		}
		Ensure the JSON is valid and can be parsed directly. Do not include any markdown formatting, code blocks, or additional text outside of this JSON structure.`;

		const result = await model.generateContent(prompt);
		let responseText = result.response.text();

		responseText = responseText.replace(
			/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/,
			"$1"
		);

		const generatedContent = JSON.parse(responseText);

		res.json(generatedContent);
	} catch (error) {
		console.error("Gemini API Error:", error);
		res.status(500).json({ error: error.message });
	}
};

const handleGetImage = async (req, res) => {
	try {
		const { prompt } = req.body;

		if (!prompt) {
			return res.status(400).json({ error: "Prompt is required" });
		}

		const encodedPrompt = encodeURIComponent(prompt);
		const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1280&height=720&model=flux&seed=-1&nologo=true&enhance=true`;

		const response = await axios({
			method: "get",
			url: imageUrl,
			responseType: "arraybuffer",
		});

		const tempFilePath = path.join("/tmp", `${Date.now()}.png`);
		fs.writeFileSync(tempFilePath, response.data);

		const cloudinaryResponse = await uploadOnCloudinary(tempFilePath);

		if (!cloudinaryResponse) {
			return res
				.status(500)
				.json({ error: "Failed to upload image to Cloudinary" });
		}

		res.json({ imageUrl: cloudinaryResponse.secure_url });
	} catch (error) {
		console.error("Error generating image:", error);
		res.status(500).json({ error: "Failed to generate image" });
	}
};

module.exports = {
	handleGetSummary,
	handleGetContent,
	handleGetImage,
};