import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedReceipt } from "./types";

const MODEL = "claude-sonnet-5";

const EXTRACT_TOOL: Anthropic.Tool = {
  name: "record_receipt",
  description: "Record the itemized contents of a receipt.",
  input_schema: {
    type: "object",
    properties: {
      vendor: { type: "string", description: "Store/vendor name on the receipt" },
      date: { type: "string", description: "Receipt date in YYYY-MM-DD format, empty string if not legible" },
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            quantity: { type: "number" },
            unitPrice: { type: "number" },
            totalPrice: { type: "number" },
          },
          required: ["name", "quantity", "unitPrice", "totalPrice"],
        },
      },
      receiptTotal: { type: "number", description: "Total amount on the receipt" },
    },
    required: ["vendor", "date", "items", "receiptTotal"],
  },
};

export async function extractReceipt(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<ExtractedReceipt> {
  if (!process.env.ANTHROPIC_API_KEY) {
    const allKeys = Object.keys(process.env).sort();
    throw new Error(
      `ANTHROPIC_API_KEY is not set in this environment. ` +
        `All ${allKeys.length} env var keys visible to this process: ${JSON.stringify(allKeys)}`
    );
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    tools: [EXTRACT_TOOL],
    tool_choice: { type: "tool", name: "record_receipt" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: imageBase64 },
          },
          {
            type: "text",
            text:
              "This is a photo of a Restaurant Depot receipt. Extract every line item " +
              "with its name, quantity, unit price, and total price, plus the vendor, " +
              "date, and receipt total. If a quantity or unit price isn't printed, " +
              "infer it from the total when possible, otherwise use 1 for quantity. " +
              "Use the record_receipt tool to report the result.",
          },
        ],
      },
    ],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("Claude did not return structured receipt data");
  }

  return toolUse.input as ExtractedReceipt;
}
