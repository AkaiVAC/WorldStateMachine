export type Model = {
  id: string;
  name: string;
};

export const fetchModels = async (): Promise<Model[]> => {
  const res = await fetch("/api/models");
  return res.json();
};
