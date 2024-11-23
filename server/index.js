import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const openai = new OpenAI();

const corsOptions = {
  origin: "chrome-extension://jmhlnbiejdlodhnbcpcncjcegclkblgg", // Allow Chrome extension's origin
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

// Route - summarize page text
app.post("/summarize", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res
      .status(400)
      .json({ error: "Text is required for summarization" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful homework assistant tasked with summarizing the text scraped from a webpage.",
        },
        {
          role: "user",
          content: `Summarize the following website's text concisely, keep it under 2 sentences:\n\n${text}`,
        },
      ],
    });

    const content = completion.choices[0].message.content;

    res.json({ summary: content });
  } catch (error) {
    console.error("Error summarizing text:", error.message);
    res.status(500).json({ error: "Failed to summarize text" });
  }
});

// Route - answer question about page text
app.post("/question", async (req, res) => {
  const { text, question } = req.body;

  if (!text) {
    return res
      .status(400)
      .json({ error: "A text is required for question answering" });
  }

  if (!text) {
    return res
      .status(400)
      .json({ error: "A question is required for question answering" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful homework assistant tasked with answering questions based on the provided text.",
        },
        {
          role: "user",
          content: `Answer the following question concisely: \n\n${question} \n\nYour annswer should be based this text: \n\n${text}`,
        },
      ],
    });

    const content = completion.choices[0].message.content;

    res.json({ summary: content });
  } catch (error) {
    console.error("Error answering question:", error.message);
    res.status(500).json({ error: "Failed to answer question" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
