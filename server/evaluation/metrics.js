export class EvaluationMetrics {
  constructor() {
    this.queryHistory = [];
    this.performanceMetrics = {
      totalQueries: 0,
      avgLatency: 0,
      avgRelevanceScore: 0,
      successRate: 0
    };
  }

  calculateMetrics(response, latency) {
    const metrics = {
      latency,
      relevanceScore: response.relevanceScore,
      sourcesCount: response.sources.length,
      contextLength: response.context.length,
      timestamp: new Date(),
      success: response.sources.length > 0
    };

    // RAGAS-inspired metrics
    metrics.faithfulness = this.calculateFaithfulness(response.answer, response.context);
    metrics.answerRelevancy = this.calculateAnswerRelevancy(response.answer, response.sources);
    metrics.contextRecall = this.calculateContextRecall(response.sources, response.context);
    metrics.contextPrecision = this.calculateContextPrecision(response.sources);
    
    // Update performance metrics
    this.updatePerformanceMetrics(metrics);
    
    return metrics;
  }

  calculateFaithfulness(answer, context) {
    if (!context || context.length === 0) return 0;
    
    // Simple faithfulness check: how much of the answer is grounded in context
    const answerWords = answer.text ? answer.text.toLowerCase().split(/\s+/) : [];
    const contextWords = context.toLowerCase().split(/\s+/);
    
    const groundedWords = answerWords.filter(word => 
      contextWords.includes(word) && word.length > 3
    );
    
    return answerWords.length > 0 ? groundedWords.length / answerWords.length : 0;
  }

  calculateAnswerRelevancy(answer, sources) {
    if (!sources || sources.length === 0) return 0;
    
    // Measure how relevant the answer is to the retrieved sources
    const avgSourceSimilarity = sources.reduce((sum, source) => 
      sum + source.similarity, 0) / sources.length;
    
    const answerConfidence = answer.confidence || 0.5;
    
    return (avgSourceSimilarity + answerConfidence) / 2;
  }

  calculateContextRecall(sources, context) {
    if (!sources || sources.length === 0) return 0;
    
    // Measure how much of the relevant information was retrieved
    const totalSources = sources.length;
    const highQualitySources = sources.filter(source => source.similarity > 0.7).length;
    
    return totalSources > 0 ? highQualitySources / totalSources : 0;
  }

  calculateContextPrecision(sources) {
    if (!sources || sources.length === 0) return 0;
    
    // Measure precision of retrieved context
    let cumulativePrecision = 0;
    let relevantFound = 0;
    
    sources.forEach((source, index) => {
      if (source.similarity > 0.5) {
        relevantFound++;
        cumulativePrecision += relevantFound / (index + 1);
      }
    });
    
    const relevantSources = sources.filter(s => s.similarity > 0.5).length;
    return relevantSources > 0 ? cumulativePrecision / relevantSources : 0;
  }

  updatePerformanceMetrics(metrics) {
    this.queryHistory.push(metrics);
    this.performanceMetrics.totalQueries++;
    
    // Calculate running averages
    const recentQueries = this.queryHistory.slice(-100); // Last 100 queries
    this.performanceMetrics.avgLatency = recentQueries.reduce((sum, q) => 
      sum + q.latency, 0) / recentQueries.length;
    
    this.performanceMetrics.avgRelevanceScore = recentQueries.reduce((sum, q) => 
      sum + q.relevanceScore, 0) / recentQueries.length;
    
    this.performanceMetrics.successRate = recentQueries.filter(q => 
      q.success).length / recentQueries.length;
  }

  getPerformanceReport() {
    const recent = this.queryHistory.slice(-50);
    
    return {
      overview: this.performanceMetrics,
      detailedMetrics: {
        avgFaithfulness: recent.reduce((sum, q) => sum + q.faithfulness, 0) / recent.length,
        avgAnswerRelevancy: recent.reduce((sum, q) => sum + q.answerRelevancy, 0) / recent.length,
        avgContextRecall: recent.reduce((sum, q) => sum + q.contextRecall, 0) / recent.length,
        avgContextPrecision: recent.reduce((sum, q) => sum + q.contextPrecision, 0) / recent.length
      },
      latencyDistribution: this.getLatencyDistribution(recent),
      queryTypes: this.getQueryTypeDistribution(recent)
    };
  }

  getLatencyDistribution(queries) {
    const buckets = { fast: 0, medium: 0, slow: 0 };
    queries.forEach(q => {
      if (q.latency < 1000) buckets.fast++;
      else if (q.latency < 3000) buckets.medium++;
      else buckets.slow++;
    });
    return buckets;
  }

  getQueryTypeDistribution(queries) {
    const types = {};
    queries.forEach(q => {
      const intent = q.intent || 'general';
      types[intent] = (types[intent] || 0) + 1;
    });
    return types;
  }
}