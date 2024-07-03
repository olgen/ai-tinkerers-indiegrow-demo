import { ChatOpenAI } from '@langchain/openai';

const llm = new ChatOpenAI({
	model: 'gpt-4o',
	temperature: 0
});

import { TavilySearchResults } from '@langchain/community/tools/tavily_search';

const tools = [new TavilySearchResults({ maxResults: 5 })];

import { createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const briefing = `You're a helpful marketing assistant to an indie app developer.
Your goal is to find conversations on reddit.com that are relevant to the use cases of the app.

Tasks:
- from the users's input about his app compile a list of search terms that you can use to find relevant user questions like "How do I do X?", "What's the best app to do X?" where X is some of the use cases of the app.
- use the tools to find relevant posts on reddit.com using the search terms, return 5 posts per search term. only search for posts on reddit and no other sites.
- select only posts that are relevant to the app and provide a list of those posts

Respond with the list of search terms you have used and with the list of relevant posts.
`;

// Prompt template must have "input" and "agent_scratchpad input variables"
const prompt = ChatPromptTemplate.fromMessages([
	['system', briefing],
	['placeholder', '{chat_history}'],
	['human', '{input}'],
	['placeholder', '{agent_scratchpad}']
]);

const agent = await createToolCallingAgent({
	llm,
	tools,
	prompt
});

import { AgentExecutor } from 'langchain/agents';

const agentExecutor = new AgentExecutor({
	agent,
	tools
});

const result = await agentExecutor.invoke({
	// input:
	// 	'My app is about helping people living in cities in Germany to easily connect with neighbors living in the same building.'
	// input: 'My app is helping indie mobile app developers launching and growing their app. We help improving their ASO'
	input: `My app is: SolarWatch Sunrise Sunset Time

	App Description:
	Discover the power of the sun with SolarWatch - the ultimate companion for outdoor enthusiasts and photographers!
Plan your day with confidence using accurate sunrise, sunset, and twilight times, and never miss a perfect moment again with customizable solar alarms. SolarWatch's AR mode and map overlays make it easy to find the best lighting for your photos, while the app's widgets keep you informed at a glance.
Whether you're hiking, camping, or simply enjoying nature, SolarWatch helps you live in harmony with the sun's natural rhythm. Picture yourself capturing breathtaking sunsets and golden hour moments with ease - all thanks to SolarWatch's powerful features.
- Accurate sun-tracking for your location

- AR mode and map overlays for perfect photo planning

- Convenient widgets for your Home Screen, Lock Screen, and Watch

- Customizable solar alarms for key moments

- Plan sunlight exposure for your home or office
	`
});

console.log(result.output);
