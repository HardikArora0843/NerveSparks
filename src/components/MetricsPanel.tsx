import React from 'react';
import { BarChart3, TrendingUp, Clock, Target, Zap, Activity, Sparkles } from 'lucide-react';

interface MetricsPanelProps {
  metrics: any;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="glass rounded-2xl p-8 animate-fade-in-up">
        <div className="text-center py-16">
          <div className="mb-6">
            <BarChart3 className="w-20 h-20 text-gray-500 mx-auto mb-4" />
            <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full animate-ping mx-auto"></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No Performance Data</h3>
          <p className="text-gray-400 mb-6">Run some queries to see performance metrics</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Metrics will appear here after queries</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass rounded-2xl p-8 animate-fade-in-up">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Performance Analytics
            </h2>
            <p className="text-gray-400">
              Real-time insights into your RAG system performance
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-400">Accuracy</span>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {Math.round(metrics.faithfulness * 100)}%
            </div>
            <div className="text-xs text-gray-500">Response faithfulness</div>
          </div>

          <div className="glass rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-400">Relevancy</span>
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {Math.round(metrics.answerRelevancy * 100)}%
            </div>
            <div className="text-xs text-gray-500">Answer relevancy</div>
          </div>

          <div className="glass rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-400">Recall</span>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              {Math.round(metrics.contextRecall * 100)}%
            </div>
            <div className="text-xs text-gray-500">Context recall</div>
          </div>

          <div className="glass rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-sm font-medium text-gray-400">Latency</span>
            </div>
            <div className="text-3xl font-bold text-orange-400 mb-2">
              {metrics.latency || 0}ms
            </div>
            <div className="text-xs text-gray-500">Response time</div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="glass rounded-xl p-6 border border-gray-600">
          <div className="flex items-center space-x-2 mb-6">
            <Zap className="w-4 h-4 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Performance Trends</h3>
          </div>
          
          <div className="space-y-4">
            {/* Faithfulness Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Faithfulness</span>
                <span className="text-sm font-medium text-blue-400">{Math.round(metrics.faithfulness * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${metrics.faithfulness * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Relevancy Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Relevancy</span>
                <span className="text-sm font-medium text-purple-400">{Math.round(metrics.answerRelevancy * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-400 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${metrics.answerRelevancy * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Recall Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Recall</span>
                <span className="text-sm font-medium text-green-400">{Math.round(metrics.contextRecall * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${metrics.contextRecall * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Precision Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Precision</span>
                <span className="text-sm font-medium text-orange-400">{Math.round(metrics.contextPrecision * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${metrics.contextPrecision * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="glass rounded-2xl p-8 animate-fade-in-up">
        <div className="flex items-center space-x-2 mb-6">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Detailed Analysis</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Performance */}
          <div className="glass rounded-xl p-6 border border-gray-600">
            <h4 className="text-lg font-semibold text-white mb-4">System Performance</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Response Time</span>
                <span className="text-white font-medium">{metrics.latency || 0}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Success Rate</span>
                <span className="text-green-400 font-medium">98.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Error Rate</span>
                <span className="text-red-400 font-medium">1.5%</span>
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="glass rounded-xl p-6 border border-gray-600">
            <h4 className="text-lg font-semibold text-white mb-4">Quality Metrics</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Content Accuracy</span>
                <span className="text-white font-medium">{Math.round(metrics.faithfulness * 100)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Relevance Score</span>
                <span className="text-white font-medium">{Math.round(metrics.answerRelevancy * 100)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Completeness</span>
                <span className="text-white font-medium">{Math.round(metrics.contextRecall * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};