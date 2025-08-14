import React from 'react';
import { DocumentUpload } from './components/DocumentUpload';
import { DocumentList } from './components/DocumentList';
import { QueryInterface } from './components/QueryInterface';
import { MetricsPanel } from './components/MetricsPanel';
import { Header } from './components/Header';
import { FileText, Brain, BarChart3, Sparkles } from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import axios from 'axios';

interface Document {
  _id: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
  processingResult: any;
  status: string;
}

function AppContent() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = React.useState('upload');
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = React.useState<string[]>([]);
  const [metrics, setMetrics] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch documents on component mount
  React.useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/documents');
      console.log('Fetched documents:', response.data);
      // Ensure response.data is an array
      const documentsArray = Array.isArray(response.data) ? response.data : [];
      setDocuments(documentsArray);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      setDocuments([]); // Ensure documents is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUploaded = (newDoc: Document) => {
    console.log('Document uploaded:', newDoc);
    setDocuments(prev => [newDoc, ...prev]);
  };

  const handleQueryResponse = (response, queryMetrics) => {
    setMetrics(queryMetrics);
  };

  const tabs = [
    { id: 'upload', label: 'Upload & Process', icon: FileText },
    { id: 'query', label: 'Query Documents', icon: Brain },
    { id: 'metrics', label: 'Performance', icon: BarChart3 }
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl animate-float ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10' 
            : 'bg-gradient-to-r from-purple-500/5 to-blue-500/5'
        }`}></div>
        <div className={`absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl animate-float ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10' 
            : 'bg-gradient-to-r from-indigo-500/5 to-purple-500/5'
        }`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl animate-pulse-slow ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-blue-500/5 to-cyan-500/5' 
            : 'bg-gradient-to-r from-blue-500/3 to-cyan-500/3'
        }`}></div>
      </div>

      <div className="relative z-10">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="glass rounded-2xl p-2 mb-8 animate-fade-in-up">
            <div className="flex space-x-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 relative overflow-hidden group ${
                      activeTab === tab.id
                        ? 'gradient-primary text-white shadow-lg transform scale-105'
                        : theme === 'dark' 
                          ? 'text-gray-300 hover:text-white hover:bg-white/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                    }`}
                  >
                    <Icon size={20} className={`transition-transform duration-300 ${activeTab === tab.id ? 'animate-pulse-slow' : 'group-hover:scale-110'}`} />
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <Sparkles size={16} className="absolute right-3 animate-pulse-slow" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-8">
              {activeTab === 'upload' && (
                <div className="space-y-8 animate-fade-in-up">
                  <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />
                  {loading ? (
                    <div className="glass rounded-2xl p-8">
                      <div className="animate-pulse">
                        <div className={`h-6 rounded-lg w-1/4 mb-6 ${
                          theme === 'dark' 
                            ? 'bg-gradient-to-r from-gray-600 to-gray-700' 
                            : 'bg-gradient-to-r from-gray-200 to-gray-300'
                        }`}></div>
                        <div className="space-y-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className={`h-16 rounded-xl ${
                              theme === 'dark' 
                                ? 'bg-gradient-to-r from-gray-600 to-gray-700' 
                                : 'bg-gradient-to-r from-gray-200 to-gray-300'
                            }`}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <DocumentList 
                      documents={documents}
                      selectedDocuments={selectedDocuments}
                      onSelectionChange={setSelectedDocuments}
                    />
                  )}
                </div>
              )}

              {activeTab === 'query' && (
                <div className="animate-fade-in-up">
                  <QueryInterface 
                    selectedDocuments={selectedDocuments}
                    onQueryResponse={handleQueryResponse}
                  />
                </div>
              )}

              {activeTab === 'metrics' && (
                <div className="animate-fade-in-up">
                  <MetricsPanel metrics={metrics} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 animate-fade-in-right">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-3 h-3 status-online rounded-full animate-pulse-slow"></div>
                  <h3 className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    System Status
                  </h3>
                </div>
                
                <div className="space-y-6">
                  <div className={`flex justify-between items-center p-4 rounded-xl ${
                    theme === 'dark' 
                      ? 'bg-white/5 border border-white/10' 
                      : 'bg-black/5 border border-black/10'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Documents</span>
                    </div>
                    <span className="text-2xl font-bold text-gradient">{documents.length}</span>
                  </div>
                  
                  <div className={`flex justify-between items-center p-4 rounded-xl ${
                    theme === 'dark' 
                      ? 'bg-white/5 border border-white/10' 
                      : 'bg-black/5 border border-black/10'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Selected</span>
                    </div>
                    <span className="text-2xl font-bold text-gradient">{selectedDocuments.length}</span>
                  </div>
                  
                  <div className={`flex justify-between items-center p-4 rounded-xl ${
                    theme === 'dark' 
                      ? 'bg-white/5 border border-white/10' 
                      : 'bg-black/5 border border-black/10'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 status-online rounded-full"></div>
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Status</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium status-online text-white">
                      Online
                    </span>
                  </div>
                </div>

                {selectedDocuments.length > 0 && (
                  <div className={`mt-6 pt-6 ${
                    theme === 'dark' ? 'border-t border-white/10' : 'border-t border-black/10'
                  }`}>
                    <h4 className={`text-sm font-medium mb-4 flex items-center space-x-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <Sparkles size={16} className="text-purple-400" />
                      <span>Selected Documents</span>
                    </h4>
                    <div className="space-y-3">
                      {selectedDocuments.slice(0, 3).map(docId => {
                        const doc = documents.find(d => d._id === docId);
                        return doc ? (
                          <div key={docId} className={`p-3 rounded-lg ${
                            theme === 'dark' 
                              ? 'bg-white/5 border border-white/10 hover:bg-white/10' 
                              : 'bg-black/5 border border-black/10 hover:bg-black/10'
                          } transition-all duration-300`}>
                            <div className={`text-sm truncate flex items-center space-x-2 ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              <FileText size={14} className="text-blue-400 flex-shrink-0" />
                              <span>{doc.filename}</span>
                            </div>
                          </div>
                        ) : null;
                      })}
                      {selectedDocuments.length > 3 && (
                        <div className={`text-sm text-center py-2 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          +{selectedDocuments.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;