import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

const schema = z.object({
  problem: z.string(),
  customer: z.string(),
  market: z.string(),
  competitor: z.array(
    z.object({
      name: z.string(),
      differentiation: z.string(),
    })
  ).length(3),
  tech_stack: z.array(z.string()).min(4).max(6),
  risk_level: z.enum(["LOW", "MEDIUM", "HIGH"]),
  profitability_score: z.number().int().min(0).max(100),
  justification: z.string(),
});

const parser = StructuredOutputParser.fromZodSchema(schema);

const prompt = PromptTemplate.fromTemplate(`
You are an expert startup consultant.

Analyze the following startup idea and return a SINGLE valid JSON object
with EXACTLY the following fields:

{{
  "problem": string,
  "customer": string,
  "market": string,
  "competitor": [
    {{ "name": string, "differentiation": string }},
    {{ "name": string, "differentiation": string }},
    {{ "name": string, "differentiation": string }}
  ],
  "tech_stack": string[],
  "risk_level": "LOW" | "MEDIUM" | "HIGH",
  "profitability_score": number,
  "justification": string
}}

STRICT RULES:
- Keep answers concise and realistic
- competitor MUST contain EXACTLY 3 competitors
- tech_stack MUST contain 4–6 practical MVP technologies
- profitability_score MUST be an integer between 0–100
- Do NOT add extra fields
- Output ONLY valid JSON

Startup Idea:
"{idea}"

{format_instructions}
`);

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.3,
});

export const ideaValidationChain = RunnableSequence.from([
  {
    idea: (input) => input.idea,
    format_instructions: () => parser.getFormatInstructions(),
  },
  prompt,
  model,
  parser,
]);
