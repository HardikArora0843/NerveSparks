import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, AlertCircle, CheckCircle, Loader, Sparkles, Zap } from 'lucide-react';
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

interface DocumentUploadProps {
  onDocumentUploaded: (document: Document) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onDocumentUploaded }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          setUploadProgress(percentCompleted);
        },
      });

      setUploadStatus('success');
      setUploadedDocument(response.data);
      
      // Construct the document object that matches the Document interface
      const documentData: Document = {
        _id: response.data.documentId,
        filename: file.name,
        mimetype: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        processingResult: response.data.processingResult,
        status: 'processed'
      };
      
      onDocumentUploaded(documentData);
    } catch (error: any) {
      setUploadStatus('error');
      setErrorMessage(error.response?.data?.error || 'Upload failed');
    }
  }, [onDocumentUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.bmp']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
    setUploadedDocument(null);
  };

  return (
    <div className="glass rounded-2xl p-8 animate-fade-in-up">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Document Upload & Processing
            </h2>
            <p className="text-gray-400">
              Upload PDFs, images, or scanned documents for intelligent processing and analysis
            </p>
          </div>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-500 relative overflow-hidden ${
          isDragActive
            ? 'border-purple-400 bg-purple-500/10 scale-105'
            : uploadStatus === 'success'
            ? 'border-green-400 bg-green-500/10'
            : uploadStatus === 'error'
            ? 'border-red-400 bg-red-500/10'
            : 'border-gray-500 hover:border-purple-400 hover:bg-purple-500/5 hover:scale-[1.02]'
        }`}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
        
        <input {...getInputProps()} />

        {uploadStatus === 'idle' && (
          <div className="relative z-10">
            <div className="mb-6">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4 transition-all duration-300 group-hover:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              {isDragActive ? 'Drop the file here' : 'Upload Document'}
            </h3>
            <p className="text-gray-400 mb-6">
              Drag & drop a file here, or click to select one
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <FileText size={16} className="text-blue-400" />
                <span>PDF</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <Image size={16} className="text-purple-400" />
                <span>Images</span>
              </div>
              <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <span>Max 50MB</span>
              </div>
            </div>
          </div>
        )}

        {uploadStatus === 'uploading' && (
          <div className="relative z-10">
            <div className="mb-6">
              <div className="relative">
                <Loader className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-spin" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 rounded-full animate-ping"></div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Processing Document</h3>
            <p className="text-gray-400 mb-6">
              Extracting text, tables, and visual elements...
            </p>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
              <div
                className="gradient-primary h-3 rounded-full transition-all duration-300 relative overflow-hidden"
                style={{ width: `${uploadProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
            <p className="text-sm text-gray-400">{uploadProgress}% complete</p>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="relative z-10">
            <div className="mb-6">
              <div className="relative">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Upload Successful</h3>
            <p className="text-gray-400 mb-6">
              Document processed and ready for querying
            </p>
            {uploadedDocument && (
              <div className="glass rounded-xl p-6 mb-6">
                <div className="text-left space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Filename:</span>
                    <span className="text-sm font-medium text-white">{uploadedDocument.processingResult?.filename}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Type:</span>
                    <span className="text-sm font-medium text-white">{uploadedDocument.processingResult?.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Chunks:</span>
                    <span className="text-sm font-medium text-white">{uploadedDocument.processingResult?.chunks?.length || 0}</span>
                  </div>
                  {uploadedDocument.processingResult?.metadata && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Has Tables:</span>
                        <span className="text-sm font-medium text-white">
                          {uploadedDocument.processingResult.metadata.hasTables ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Has Images:</span>
                        <span className="text-sm font-medium text-white">
                          {uploadedDocument.processingResult.metadata.hasImages ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={resetUpload}
              className="btn-primary"
            >
              Upload Another Document
            </button>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="relative z-10">
            <div className="mb-6">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Upload Failed</h3>
            <p className="text-red-400 mb-6">{errorMessage}</p>
            <button
              onClick={resetUpload}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 glass rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="w-5 h-5 text-purple-400" />
          <h4 className="font-semibold text-white">Supported Processing Features:</h4>
        </div>
        <ul className="text-sm text-gray-400 space-y-2">
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
            <span>OCR for scanned documents and images</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <span>Table structure recognition and data extraction</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span>Chart and graph interpretation</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
            <span>Mixed text-image content understanding</span>
          </li>
          <li className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
            <span>Intelligent chunking strategies</span>
          </li>
        </ul>
      </div>
    </div>
  );
};