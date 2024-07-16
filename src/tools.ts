// import { unfluff } from "unfluff";
import extractor from "unfluff";

import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { load } from "cheerio";

const searchTool = new TavilySearchResults({ maxResults: 5 });

const getAppInfoTool = tool(
  async (input: { url: string }): Promise<string> => {
    const response = await fetch(input.url);
    const html = await response.text();
    console.log(html);
    const $ = load(html);
    const metaDataJson = $(`[name=schema:software-application]`).html();

    if (metaDataJson) {
      const info = JSON.parse(metaDataJson.toString()) as {
        name: string;
        description: string;
      };
      return `App Name: ${info.name}\nApp Description: ${info.description}`;
    } else {
      const unfluffData = await extractor(html);
      return `App Name: ${unfluffData.title}\nApp Description: ${unfluffData.description}`;
    }
  },
  {
    name: "getAppInfo",
    description: "Get app info from a webpage url or appstore url",
    schema: z.object({
      url: z.string(),
    }),
  }
);

export const tools = [searchTool, getAppInfoTool];
