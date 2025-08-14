import React, { useState } from 'react';
import { Send, Brain, Clock, Target, FileText, BarChart3, Sparkles, Zap, MessageSquare } from 'lucide-react';
import axios from 'axios';

interface QueryResponse {
  response: {
    text: string;
    confidence: number;
    intent: string;
  };
  sources: Array<{
    content: string;
    similarity: number;
    documentId: string;
    type: string;
    metadata: any;
  }>;
  relevanceScore: number;
  metrics: any;
  latency: number;
}

interface QueryInterfaceProps {
  selectedDocuments: string[];
  onQueryResponse?: (response: QueryResponse, metrics: any) => void;
}

export const QueryInterface: React.FC<QueryInterfaceProps> = ({
  selectedDocuments,
  onQueryResponse
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [queryHistory, setQueryHistory] = useState<Array<{
    query: string;
    response: QueryResponse;
    timestamp: Date;
  }>>([]);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    if (selectedDocuments.length === 0) {
      alert('Please select at least one document to query');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('/api/query', {
        query: query.trim(),
        documentIds: selectedDocuments,
        filters: {}
      });

      const queryResponse: QueryResponse = response.data;
      setResponse(queryResponse);
      
      // Add to history
      setQueryHistory(prev => [{
        query: query.trim(),
        response: queryResponse,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]); // Keep last 10 queries

      // Callback to parent
      onQueryResponse?.(queryResponse, queryResponse.metrics);
      
      setQuery('');
    } catch (error: any) {
      console.error('Query failed:', error);
      alert(error.response?.data?.error || 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  const suggestedQueries = [
    "What are the key findings in the documents?",
    "Can you extract data from any tables?",
    "What charts or graphs are shown?",
    "Summarize the main points",
    "What statistical data is available?"
  ];

  return (
    <div className="space-y-8">
      {/* Query Input */}
      <div className="glass rounded-2xl p-8 animate-fade-in-up">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Query Documents
              </h2>
              <p className="text-gray-400">
                Ask questions about your uploaded documents using natural language
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleQuery} className="space-y-6">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your documents..."
              className="w-full p-6 bg-gray-800/50 border-2 border-gray-600 rounded-2xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
              rows={4}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute bottom-4 right-4 p-3 gradient-primary text-white rounded-xl hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <FileText size={14} className="text-blue-400" />
                <span>{selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected</span>
              </div>
            </div>
            {loading && (
              <div className="flex items-center space-x-2 text-sm text-purple-400">
                <Brain className="w-4 h-4 animate-pulse" />
                <span>Processing query...</span>
              </div>
            )}
          </div>
        </form>

        {/* Suggested Queries */}
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <p className="text-sm font-medium text-white">Suggested queries:</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {suggestedQueries.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setQuery(suggestion)}
                className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all duration-300 hover:scale-105 border border-white/10"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Query Response */}
      {response && (
        <div className="glass rounded-2xl p-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Response</h3>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <Clock size={14} />
                <span>{response.latency}ms</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <Target size={14} />
                <span>{Math.round(response.relevanceScore * 100)}% relevance</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <BarChart3 size={14} />
                <span>{Math.round(response.response.confidence * 100)}% confidence</span>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <div className="glass rounded-xl p-6 mb-6 border border-purple-500/20">
              <p className="text-gray-200 leading-relaxed text-lg">
                {response.response.text}
              </p>
            </div>

            <div className="flex items-center space-x-3 mb-6">
              <span className="text-sm font-medium text-gray-300">Query Intent:</span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full border border-purple-500/30">
                {response.response.intent}
              </span>
            </div>
          </div>

          {/* Sources */}
          {response.sources.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-4 h-4 text-blue-400" />
                <h4 className="text-lg font-semibold text-white">Sources</h4>
              </div>
              <div className="space-y-4">
                {response.sources.map((source, index) => (
                  <div key={index} className="glass rounded-xl p-4 border border-gray-600 hover:border-purple-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <FileText size={14} className="text-blue-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-white">
                            Source {index + 1}
                          </span>
                          <span className="ml-2 px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                            {source.type}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-blue-400 font-medium">
                        {Math.round(source.similarity * 100)}% match
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {source.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          {response.metrics && (
            <div className="mt-8 glass rounded-xl p-6 border border-gray-600">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <h4 className="text-lg font-semibold text-white">Performance Metrics</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400">
                    {Math.round(response.metrics.faithfulness * 100)}%
                  </div>
                  <div className="text-xs text-gray-400">Faithfulness</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.round(response.metrics.answerRelevancy * 100)}%
                  </div>
                  <div className="text-xs text-gray-400">Answer Relevancy</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400">
                    {Math.round(response.metrics.contextRecall * 100)}%
                  </div>
                  <div className="text-xs text-gray-400">Context Recall</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="text-2xl font-bold text-orange-400">
                    {Math.round(response.metrics.contextPrecision * 100)}%
                  </div>
                  <div className="text-xs text-gray-400">Context Precision</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Query History */}
      {queryHistory.length > 0 && (
        <div className="glass rounded-2xl p-8 animate-fade-in-up">
          <div className="flex items-center space-x-2 mb-6">
            <Zap className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Recent Queries</h3>
          </div>
          <div className="space-y-4">
            {queryHistory.slice(0, 5).map((item, index) => (
              <div key={index} className="p-4 glass rounded-xl border border-gray-600 hover:border-purple-400/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-white">{item.query}</p>
                  <span className="text-xs text-gray-500">
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>{Math.round(item.response.relevanceScore * 100)}% relevance</span>
                  <span>{item.response.sources.length} sources</span>
                  <span>{item.response.latency}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};