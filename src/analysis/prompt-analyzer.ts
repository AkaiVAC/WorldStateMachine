type AskFn = (prompt: string) => Promise<string>;

type PromptAnalyzerOptions = {
    askFn: AskFn;
    worldSetting: string;
};

type AnalysisResult = {
    entityReferences: string[];
    anachronisms: string[];
};

export type PromptAnalyzer = {
    analyze: (text: string) => Promise<AnalysisResult>;
};

const buildPrompt = (text: string, worldSetting: string): string => {
    return `Analyze the text below for a "${worldSetting}" setting.

Tasks:
1. Extract "entityReferences": specific people, places, organizations, or titles mentioned.
2. Extract "anachronisms": terms, objects, or concepts that do not fit a ${worldSetting} setting (e.g. modern technology, slang, real-world brands).

Return ONLY valid JSON:
{
  "entityReferences": ["string"],
  "anachronisms": ["string"]
}

Text: "${text}"`;
};

const parseResponse = (response: string): AnalysisResult => {
    try {
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanResponse);
        return {
            entityReferences: Array.isArray(parsed.entityReferences)
                ? parsed.entityReferences
                : [],
            anachronisms: Array.isArray(parsed.anachronisms)
                ? parsed.anachronisms
                : [],
        };
    } catch {
        return { entityReferences: [], anachronisms: [] };
    }
};

export const createPromptAnalyzer = (
    options: PromptAnalyzerOptions
): PromptAnalyzer => {
    const { askFn, worldSetting } = options;

    return {
        analyze: async (text: string): Promise<AnalysisResult> => {
            if (!text.trim()) {
                return { entityReferences: [], anachronisms: [] };
            }

            const prompt = buildPrompt(text, worldSetting);
            const response = await askFn(prompt);
            return parseResponse(response);
        },
    };
};
