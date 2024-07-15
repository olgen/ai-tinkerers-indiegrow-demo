import { RunLogPatch } from "@langchain/core/tracers/log_stream";

export async function filterLogStream(
  logStream: AsyncGenerator<RunLogPatch, any, unknown>
): Promise<ReadableStream> {
  const stream = new ReadableStream({
    async start(controller) {
      // 'Creative filtering" - the agent framework doesn't support streaming out of the box right now
      // 	based on: https://js.langchain.com/v0.1/docs/modules/agents/how_to/streaming/
      for await (const chunk of logStream) {
        if (chunk.ops?.length > 0 && chunk.ops[0].op === "add") {
          const addOp = chunk.ops[0];
          if (
            addOp.path.startsWith("/logs/ChatOpenAI") &&
            typeof addOp.value === "string" &&
            addOp.value.length
          ) {
            const newVal = addOp.value;
            controller.enqueue(newVal);
          }
        }
      }
      controller.close();
    },
  });
  return stream;
}

export async function* streamToLines(
  stream: ReadableStream
): AsyncGenerator<string> {
  const reader = stream.getReader();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += value;
    let lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      yield line;
    }
  }

  if (buffer.length > 0) {
    yield buffer;
  }
}
