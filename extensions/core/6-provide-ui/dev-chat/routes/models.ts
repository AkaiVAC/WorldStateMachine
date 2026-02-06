export type Model = {
  id: string;
  name: string;
};

type OpenRouterModel = {
  id: string;
  name: string;
};

type OpenRouterModelsResponse = {
  data: OpenRouterModel[];
};

export const fetchModels = async (): Promise<Model[]> => {
  const res = await fetch("https://openrouter.ai/api/v1/models");
  const data = (await res.json()) as OpenRouterModelsResponse;

  return data.data
    .map((m) => ({ id: m.id, name: m.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const modelsHandler = async (): Promise<Response> => {
  const models = await fetchModels();
  return Response.json(models);
};
