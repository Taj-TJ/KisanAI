const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    this.model = this.genAI ? this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;
    this.visionModel = this.genAI ? this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;
    this.enabled = !!apiKey;
  }

  async callGemini(prompt, isJson = false, isVision = false, imageData = null) {
    if (!this.enabled) return null;

    try {
      let result;
      if (isVision && imageData) {
        result = await this.visionModel.generateContent([
          prompt,
          {
            inlineData: {
              data: imageData.toString("base64"),
              mimeType: "image/jpeg",
            },
          },
        ]);
      } else {
        result = await this.model.generateContent(prompt);
      }

      const response = await result.response;
      let text = response.text();

      if (isJson) {
        // Clean up markdown code blocks if AI included them
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      }

      return text;
    } catch (error) {
      console.error("[AIService] Error:", error.message);
      if (error.message.includes("quota") || error.message.includes("429")) {
        return "QUOTA_EXCEEDED";
      }
      return null;
    }
  }
}

module.exports = AIService;
