const express = require("express");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// --------------------------------------------------
// DEMO TREND SOURCES
// --------------------------------------------------
// Version 1 uses a small set of live-ish trend searches.
// We'll replace/expand these with dedicated trend APIs
// after the basic system is working.
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

// Generate trend ideas with AI
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

Return ONLY valid JSON in this format:

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

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.8,
    messages: [
      {
        role: "system",
        content: "You are an expert viral short-form content analyst."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const text = response.choices[0].message.content;

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("AI returned invalid JSON:", text);

    return {
      trends: []
    };
  }
}

// API endpoint
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
      error: "Unable to generate trends.",
      details: error.message
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    bot: "Viral Trend Bot",
    version: "1.0"
  });
});

app.listen(PORT, () => {
  console.log(`Viral Trend Bot running on port ${PORT}`);
});
