# 🚀 Enhanced RAG System Setup Guide

## Overview

This enhanced RAG (Retrieval-Augmented Generation) system now supports real document processing with multiple API integrations for:

- **Document Processing**: PDF, images, scanned documents
- **OCR Services**: Google Vision API, Azure Cognitive Services, Tesseract.js
- **Embeddings**: OpenAI, HuggingFace Sentence Transformers
- **LLM Generation**: OpenAI GPT, HuggingFace models
- **Vector Search**: Real embeddings with cosine similarity

## 🔧 Environment Setup

### 1. Create Environment File

Create a `.env` file in the root directory with your API keys:

```env
# Server Configuration
PORT=3001
MAX_FILE_SIZE=52428800
NODE_ENV=development

# RAG Configuration
MAX_CONTEXT_LENGTH=4000
TOP_K_RESULTS=5
MIN_SIMILARITY_THRESHOLD=0.3

# OpenAI API (for embeddings and LLM)
OPENAI_API_KEY=your_openai_api_key_here

# HuggingFace API (for embeddings and LLM fallback)
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Google Vision API (for OCR and image analysis)
GOOGLE_VISION_API_KEY=your_google_vision_api_key_here
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json

# Azure Cognitive Services (for OCR and image analysis)
AZURE_COGNITIVE_SERVICES_KEY=your_azure_key_here
AZURE_COGNITIVE_SERVICES_ENDPOINT=your_azure_endpoint_here

# Tesseract (Local OCR fallback)
TESSERACT_PATH=/usr/bin/tesseract

# MongoDB Database (optional for production)
MONGODB_URI=mongodb://localhost:27017/rag-system

# Pinecone Vector Database (optional for production)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment
```

### 2. API Key Setup

#### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add to `.env`: `OPENAI_API_KEY=sk-...`

#### HuggingFace API
1. Go to [HuggingFace](https://huggingface.co/)
2. Create an account and get your API key
3. Add to `.env`: `HUGGINGFACE_API_KEY=hf_...`

#### Google Vision API (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Vision API
3. Create credentials (API key or service account)
4. Add to `.env`: `GOOGLE_VISION_API_KEY=...`

#### Azure Cognitive Services (Optional)
1. Go to [Azure Portal](https://portal.azure.com/)
2. Create a Computer Vision resource
3. Get the key and endpoint
4. Add to `.env`: `AZURE_COGNITIVE_SERVICES_KEY=...` and `AZURE_COGNITIVE_SERVICES_ENDPOINT=...`

## 🏃‍♂️ Running the System

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm run server
```

### 3. Start the Frontend
```bash
npm run dev
```

## 🎯 Features

### Document Processing
- **PDF Processing**: Text extraction, table detection, page splitting
- **Image Processing**: OCR with multiple services, table extraction, image analysis
- **Intelligent Chunking**: Semantic chunking with LLM assistance
- **Embedding Generation**: Real vector embeddings for similarity search

### Query Processing
- **Intent Classification**: Automatic query intent detection
- **Entity Extraction**: Named entity recognition
- **Vector Search**: Cosine similarity with real embeddings
- **Reranking**: Multi-factor relevance scoring
- **LLM Generation**: Context-aware response generation

### Evaluation Metrics
- **RAGAS Metrics**: Faithfulness, Answer Relevancy, Context Recall, Context Precision
- **Performance Monitoring**: Latency tracking, relevance scoring
- **Quality Assessment**: OCR confidence, content quality metrics

## 📊 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React)       │◄──►│   (Express)     │◄──►│   APIs          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Document      │
                       │   Processor     │
                       └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Vector Store  │
                       │   (Embeddings)  │
                       └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   RAG Pipeline  │
                       │   (Query/Gen)   │
                       └─────────────────┘
```

## 🔍 API Endpoints

### Document Upload
```http
POST /api/upload
Content-Type: multipart/form-data

Response:
{
  "success": true,
  "documentId": "1",
  "processingResult": {
    "chunksCount": 15,
    "tablesCount": 2,
    "wordCount": 1500,
    "hasImages": true,
    "ocrConfidence": 0.95
  }
}
```

### Query Documents
```http
POST /api/query
Content-Type: application/json

{
  "query": "What are the main points?",
  "documentIds": ["1", "2"],
  "filters": {
    "minSimilarity": 0.3,
    "topK": 5
  }
}

Response:
{
  "response": {
    "text": "Based on the documents...",
    "confidence": 0.85,
    "intent": "factual"
  },
  "sources": [...],
  "relevanceScore": 0.85,
  "metrics": {
    "faithfulness": 0.9,
    "answerRelevancy": 0.85,
    "contextRecall": 0.8,
    "contextPrecision": 0.9,
    "overallScore": 0.86
  },
  "latency": 1250
}
```

### Health Check
```http
GET /api/health

Response:
{
  "status": "ok",
  "documentsCount": 5,
  "mode": "real-processing-with-embeddings",
  "vectorStore": {
    "totalVectors": 75,
    "totalDocuments": 5,
    "averageChunksPerDocument": 15,
    "embeddingModels": {
      "text-embedding-ada-002": 75
    }
  },
  "services": {
    "openai": true,
    "huggingface": false,
    "googleVision": false,
    "azureVision": false
  }
}
```

## 🎨 Frontend Features

### Dark/Light Mode
- Beautiful theme toggle with smooth animations
- Professional dark mode as default
- Responsive design with glass morphism effects

### Document Management
- Drag & drop file upload
- Real-time processing status
- Document list with selection
- Processing statistics

### Query Interface
- Natural language queries
- Document selection
- Real-time responses
- Source attribution
- Performance metrics

## 🚀 Performance Optimizations

### Embedding Caching
- Embeddings are generated once and cached
- Vector similarity search is optimized
- Batch processing for multiple documents

### Intelligent Chunking
- Semantic chunking with LLM assistance
- Content-aware breakpoints
- Metadata preservation

### Fallback Systems
- Multiple OCR services with automatic fallback
- Embedding service redundancy
- LLM generation fallbacks

## 🔧 Troubleshooting

### Common Issues

1. **"I don't have enough information to answer your question"**
   - Upload relevant documents first
   - Check document processing status
   - Verify OCR quality for scanned documents

2. **API Key Errors**
   - Verify API keys in `.env` file
   - Check API service status
   - Ensure proper permissions

3. **Slow Processing**
   - Check internet connection
   - Verify API rate limits
   - Consider using local OCR (Tesseract)

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## 📈 Monitoring

### Health Check
Monitor system health at `/api/health`

### Vector Store Stats
Check vector store statistics at `/api/vector-stats`

### Performance Metrics
- Query latency tracking
- Relevance score monitoring
- RAGAS metrics calculation

## 🎯 Next Steps

1. **Add API Keys**: Configure your preferred services
2. **Upload Documents**: Test with PDFs and images
3. **Query System**: Ask questions about your documents
4. **Monitor Performance**: Check health and metrics
5. **Scale Up**: Consider production deployment with MongoDB and Pinecone

## 🆘 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all API keys are correctly configured
3. Ensure all dependencies are installed
4. Check the health endpoint for service status

The system will gracefully fall back to simpler methods if external APIs are unavailable, ensuring it always works even without all services configured.
