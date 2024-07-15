import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { load } from "cheerio";

const searchTool = new TavilySearchResults({ maxResults: 5 });

const getAppInfoTool = tool(
  async (input: { appStoreUrl: string }): Promise<string> => {
    const response = await fetch(input.appStoreUrl);
    const html = await response.text();
    const $ = load(html);
    const metaDataJson = $(`[name=schema:software-application]`).html();

    if (!metaDataJson) {
      return "Could not find app metadata json.";
    }
    const info = JSON.parse(metaDataJson.toString()) as {
      name: string;
      description: string;
    };
    return `App Name: ${info.name}\nApp Description: ${info.description}`;
  },
  {
    name: "getAppInfo",
    description: "Get app info from the App Store",
    schema: z.object({
      appStoreUrl: z.string(),
    }),
  }
);

export const tools = [searchTool, getAppInfoTool];
