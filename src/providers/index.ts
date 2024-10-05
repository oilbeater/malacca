import { azureOpenAIProvider } from './azureOpenAI';
import { workersAIProvider } from './workersAI';

export const providers = {
  'azure-openai': azureOpenAIProvider,
  'workers-ai': workersAIProvider,
};