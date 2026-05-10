import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { agentTools } from "@/lib/anthropic/tools";
import { executeTool } from "@/lib/anthropic/tool-executor";
import { getSystemPrompt } from "@/lib/anthropic/system-prompt";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { messages } = await req.json() as { messages: Anthropic.MessageParam[] };

  // Load last 20 messages from DB as context (not passed by client for efficiency)
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role,content")
    .order("created_at", { ascending: false })
    .limit(20);

  const historyMessages: Anthropic.MessageParam[] = (history ?? [])
    .reverse()
    .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

  // Combine history with current message (avoid duplicates)
  const allMessages: Anthropic.MessageParam[] = [...historyMessages, ...messages];

  const claudeMessages: Anthropic.MessageParam[] = allMessages;
  let finalContent = "";
  let navigateTo: { route: string } | undefined;

  const MAX_ITERATIONS = 10;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: getSystemPrompt(new Date().toISOString().split("T")[0]),
      tools: agentTools,
      messages: claudeMessages,
    });

    claudeMessages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find(b => b.type === "text");
      if (textBlock && textBlock.type === "text") finalContent = textBlock.text;
      break;
    }

    if (response.stop_reason !== "tool_use") {
      const textBlock = response.content.find(b => b.type === "text");
      if (textBlock && textBlock.type === "text") finalContent = textBlock.text;
      break;
    }

    // Execute all tool calls in this turn
    const toolUseBlocks = response.content.filter(b => b.type === "tool_use");
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of toolUseBlocks) {
      if (block.type !== "tool_use") continue;
      const result = await executeTool(block.name, block.input as Record<string, unknown>, block.id, supabase);
      toolResults.push({ type: "tool_result", tool_use_id: result.tool_use_id, content: result.content });
      if (result.navigate) navigateTo = result.navigate;
    }

    claudeMessages.push({ role: "user", content: toolResults });
  }

  // Persist user message and assistant response
  const userMessage = messages[messages.length - 1];
  if (userMessage?.role === "user") {
    const userContent = typeof userMessage.content === "string" ? userMessage.content : JSON.stringify(userMessage.content);
    await supabase.from("chat_messages").insert([
      { role: "user", content: userContent },
      { role: "assistant", content: finalContent },
    ]);
  }

  return NextResponse.json({ message: finalContent, navigate: navigateTo ?? null });
}
