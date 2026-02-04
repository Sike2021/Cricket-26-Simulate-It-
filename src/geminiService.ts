
// AI Service removed as per user request.
export const streamAssistantResponse = async function* (prompt: string, history: any[], gameData: any) {
    yield "AI Assistant is disabled.";
};

export const generateMatchAnalysis = async (matchResult: any) => {
    return "Match analysis disabled.";
};
