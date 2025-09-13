export const mockWBSResponse = {
  epics: [
    {
      name: "Development",
      assumptions: ["Development environment is set up"],
      risks: ["Technical complexity"],
      modules: [
        {
          name: "Core Module",
          complexity: "M" as const,
          notes: "Main functionality",
          primary_role: "Frontend/React"
        }
      ]
    }
  ]
};

export const mockLLMResponse = {
  content: JSON.stringify(mockWBSResponse)
};

export class MockLLMProvider {
  async callWithRetryAndValidate() {
    return {
      result: mockWBSResponse,
      meta: {
        provider: 'mock',
        model: 'test-model',
        sessionId: 'test-session',
        latencyMs: 100,
        retryCount: 0,
        inputTokens: 50,
        outputTokens: 100,
        totalTokens: 150,
        timestamp: new Date().toISOString()
      }
    };
  }
}
