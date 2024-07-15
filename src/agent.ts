import { ChatOpenAI } from "@langchain/openai";
import { tools } from "./tools";

const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
});

import { createToolCallingAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const briefing = `You're a helpful marketing assistant to an indie app developer.
Your goal is to find conversations on reddit.com that are relevant to the use cases of the app.
You will be given the app store url of the app.

Tasks:
- get the info about the app from the url you're given
- from the app info compile a list of search terms that you can use to find relevant user questions like "How do I do X?", "What's the best app to do X?" where X is some of the use cases of the app.
- use the tools to find relevant posts on reddit.com using the search terms, return 5 posts per search term. only search for posts on reddit and no other sites.
- select only posts that are relevant to the app and provide a list of those posts

Respond with the list of search terms you have used and with the list of relevant posts for each search term.
Respond in markdown format.
`;

// Prompt template must have "input" and "agent_scratchpad input variables"
const prompt = ChatPromptTemplate.fromMessages([
  ["system", briefing],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

const agent = await createToolCallingAgent({
  llm,
  tools,
  prompt,
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
});

const url = process.argv[2];

const params = {
  input: url,
};

// # Variant 1: blocking result
const result = await agentExecutor.invoke(params);
console.log(result.output);

// # Variant 2: log streaming
// import { filterLogStream, streamToLines } from "./streaming";
// const logStream = await agentExecutor.streamLog(params);
// const filteredLogStream = await filterLogStream(logStream);
// const streamOfLines = await streamToLines(filteredLogStream);

// for await (const chunk of streamOfLines) {
//   console.log(chunk);
// }

// # Variant 3: streaming events
// const eventStream = agentExecutor.streamEvents(params, { version: "v1" });

// for await (const event of eventStream) {
//   const eventType = event.event;
//   if (eventType === "on_chain_start") {
//     // Was assigned when creating the agent with `.withConfig({"runName": "Agent"})` above
//     if (event.name === "Agent") {
//       console.log("\n-----");
//       console.log(
//         `Starting agent: ${event.name} with input: ${JSON.stringify(
//           event.data.input
//         )}`
//       );
//     }
//   } else if (eventType === "on_chain_end") {
//     // Was assigned when creating the agent with `.withConfig({"runName": "Agent"})` above
//     if (event.name === "Agent") {
//       console.log("\n-----");
//       console.log(`Finished agent: ${event.name}\n`);
//       console.log(`Agent output was: ${event.data.output}`);
//       console.log("\n-----");
//     }
//   } else if (eventType === "on_llm_stream") {
//     const content = event.data?.chunk?.message?.content;
//     // Empty content in the context of OpenAI means
//     // that the model is asking for a tool to be invoked via function call.
//     // So we only print non-empty content
//     if (content !== undefined && content !== "") {
//       process.stdout.write(content);
//     }
//   } else if (eventType === "on_tool_start") {
//     console.log("\n-----");
//     console.log(
//       `Starting tool: ${event.name} with inputs: ${event.data.input}`
//     );
//   } else if (eventType === "on_tool_end") {
//     // // console.log("\n-----");
//     // // console.log(`Finished tool: ${event.name}\n`);
//     // // console.log(`Tool output was: ${event.data.output}`);
//     // console.log("\n-----");
//   }
// }
