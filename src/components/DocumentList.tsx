import React, { useEffect, useState } from 'react';
import { FileText, Image, Calendar, CheckSquare, Square, Eye, Trash2, Sparkles, Database } from 'lucide-react';
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

interface DocumentListProps {
  documents: Document[];
  selectedDocuments: string[];
  onSelectionChange: (selected: string[]) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  selectedDocuments,
  onSelectionChange
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  console.log('DocumentList received documents:', documents);
  console.log('DocumentList received selectedDocuments:', selectedDocuments);

  // Ensure documents is always an array
  const safeDocuments = Array.isArray(documents) ? documents : [];
  console.log('Safe documents:', safeDocuments);

  // Ensure selectedDocuments is always an array
  const safeSelectedDocuments = Array.isArray(selectedDocuments) ? selectedDocuments : [];

  const handleSelectDocument = (documentId: string) => {
    const isSelected = safeSelectedDocuments.includes(documentId);
    if (isSelected) {
      onSelectionChange(safeSelectedDocuments.filter(id => id !== documentId));
    } else {
      onSelectionChange([...safeSelectedDocuments, documentId]);
    }
  };

  const handleSelectAll = () => {
    if (safeSelectedDocuments.length === safeDocuments.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(safeDocuments.map(doc => doc._id));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-400" />;
    } else if (mimetype.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-400" />;
    }
    return <FileText className="w-5 h-5 text-gray-400" />;
  };

  // Show loading state if documents is undefined (still loading)
  if (documents === undefined) {
    return (
      <div className="glass rounded-2xl p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Document Library
            </h2>
            <p className="text-gray-400">Manage and query your uploaded documents</p>
          </div>
        </div>
        {safeDocuments.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-purple-400 hover:bg-purple-500/10 rounded-xl transition-all duration-300 hover:scale-105"
          >
            {safeSelectedDocuments.length === safeDocuments.length ? (
              <CheckSquare size={16} className="text-purple-400" />
            ) : (
              <Square size={16} className="text-gray-400" />
            )}
            <span>Select All</span>
          </button>
        )}
      </div>

      {safeDocuments.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-6">
            <FileText className="w-20 h-20 text-gray-500 mx-auto mb-4" />
            <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full animate-ping mx-auto"></div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No documents uploaded</h3>
          <p className="text-gray-400 mb-6">Upload your first document to get started with RAG queries</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Ready to process your documents</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {safeDocuments.map((doc, index) => (
            <div
              key={doc._id}
              className={`group relative p-6 rounded-xl border transition-all duration-300 cursor-pointer hover-lift ${
                safeSelectedDocuments.includes(doc._id)
                  ? 'border-purple-400 bg-purple-500/10 shadow-lg'
                  : 'border-gray-600 hover:border-purple-400/50 hover:bg-purple-500/5'
              }`}
              onClick={() => handleSelectDocument(doc._id)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Selection indicator */}
              <div className="absolute top-4 left-4">
                <button className="flex-shrink-0">
                  {safeSelectedDocuments.includes(doc._id) ? (
                    <CheckSquare className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
                  )}
                </button>
              </div>

              <div className="flex items-start space-x-4 pl-8">
                {/* File icon */}
                <div className="flex-shrink-0 mt-1">
                  {getFileIcon(doc.mimetype)}
                </div>

                {/* Document info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {doc.filename}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      doc.status === 'processed'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 mb-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>{formatFileSize(doc.size)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} />
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    {doc.processingResult?.chunks && (
                      <div className="flex items-center space-x-2">
                        <Database size={14} />
                        <span>{doc.processingResult.chunks.length} chunks</span>
                      </div>
                    )}
                  </div>

                  {doc.processingResult?.metadata && (
                    <div className="flex items-center space-x-3 mb-4">
                      {doc.processingResult.metadata.hasTables && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          Tables
                        </span>
                      )}
                      {doc.processingResult.metadata.hasImages && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Images
                        </span>
                      )}
                      {doc.processingResult.metadata.wordCount && (
                        <span className="text-sm text-gray-500">
                          {doc.processingResult.metadata.wordCount} words
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // View document details
                    }}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-300 hover:scale-110"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Delete document
                    }}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 hover:scale-110"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {safeSelectedDocuments.length > 0 && (
        <div className="mt-8 glass rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <p className="text-sm text-white">
              <span className="font-semibold text-purple-400">{safeSelectedDocuments.length} document{safeSelectedDocuments.length > 1 ? 's' : ''} selected</span>
              {' '}for querying. Switch to the Query tab to start asking questions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};