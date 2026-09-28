const express = require("express");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --------------------------------------------------
// TREND CATEGORIES
// --------------------------------------------------

const trendTopics = [
  "AI",
  "gaming",
  "YouTube",
  "TikTok",
  "movies",
  "music",
  "memes",
  "technology",
  "sports",
  "internet culture"
];

// --------------------------------------------------
// GEMINI AI
// --------------------------------------------------

async function analyzeTrends() {

  const prompt = `
You are a viral-content trend analyst.

We are building a YouTube Shorts trend research bot.

Analyze these content categories:

${trendTopics.join(", ")}

Find 5 types of topics that could currently be attracting
large amounts of attention online.

For each one provide:

1. Topic
2. Viral score from 1-100
3. Estimated audience age
4. Why people are interested
5. A YouTube Shorts idea
6. A strong hook
7. A 35-45 second script
8. A title
9. 5 hashtags

IMPORTANT:
- Do not invent specific breaking-news facts.
- If you are uncertain whether something is currently trending,
  describe it as a trend opportunity rather than a confirmed trend.
- Focus on ideas suitable for short-form video.
- Avoid dangerous, illegal, hateful, or sexual content.

Return ONLY valid JSON.

Use exactly this format:

{
  "trends": [
    {
      "topic": "",
      "viralScore": 0,
      "audience": "",
      "whyTrending": "",
      "shortIdea": "",
      "hook": "",
      "script": "",
      "title": "",
      "hashtags": []
    }
  ]
}
`;

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
    GEMINI_API_KEY;

  const response = await fetch(url, {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],

      generationConfig: {
        temperature: 0.8,
        responseMimeType: "application/json"
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini API error:", data);

    throw new Error(
      data.error?.message ||
      "Gemini API request failed."
    );
  }

  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  try {

    return JSON.parse(text);

  } catch (error) {

    console.error("Invalid JSON from Gemini:", text);

    throw new Error(
      "Gemini returned data that could not be parsed."
    );
  }
}

// --------------------------------------------------
// TREND API
// --------------------------------------------------

app.get("/api/trends", async (req, res) => {

  try {

    const results = await analyzeTrends();

    res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      ...results
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/api/health", (req, res) => {

  res.json({
    status: "online",
    bot: "Viral Trend Bot",
    version: "1.0",
    ai: "Gemini"
  });

});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {

  console.log(
    `Viral Trend Bot running on port ${PORT}`
  );

});
