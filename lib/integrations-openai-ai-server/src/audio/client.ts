import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    "OPENAI_API_KEY must be set. Did you forget to add your OpenAI API key?",
  );
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
