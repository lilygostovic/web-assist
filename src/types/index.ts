export type ChatMessage = {
  content: string;
  speaker: "user" | "model";
};

export type ModelName = "GPT-3.5" | "GPT-4";
export const modelNames: ModelName[] = ["GPT-3.5", "GPT-4"];
