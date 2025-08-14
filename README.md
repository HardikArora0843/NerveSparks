# Advanced RAG Document Processing System

A comprehensive Retrieval-Augmented Generation (RAG) system designed to process multi-format documents (PDFs, images, scanned documents) and provide intelligent document querying capabilities with advanced OCR, table extraction, and visual element recognition.

## 🚀 Features

### Document Processing
- **Multi-format Support**: PDF, JPEG, PNG, TIFF, BMP
- **Advanced OCR**: Scanned document text extraction
- **Table Recognition**: Automatic table detection and data extraction
- **Chart Interpretation**: Visual chart and graph analysis
- **Mixed Content Understanding**: Text-image correlation and context preservation
- **Layout Analysis**: Document structure recognition

### Intelligent Retrieval
- **Semantic Search**: Vector-based similarity search
- **Context-Aware Chunking**: Optimized chunking strategies for different content types
- **Query Intent Recognition**: Automatic query classification and optimization
- **Relevance Scoring**: Multi-factor relevance calculation
- **Source Attribution**: Detailed source tracking and citation

### Performance Evaluation
- **RAGAS Metrics**: Faithfulness, Answer Relevancy, Context Recall, Context Precision
- **Real-time Monitoring**: Latency tracking and performance analytics
- **Quality Assessment**: OCR confidence scoring and content analysis

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Dropzone** for file uploads
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **MongoDB** for document metadata storage
- **In-memory Vector Store** (production-ready for Pinecone/Weaviate)
- **Multer** for file handling
- **PDF-Parse** for PDF processing
- **Sharp** for image processing

### AI/ML Components
- **Embedding Models**: OpenAI Embeddings / HuggingFace Sentence Transformers
- **OCR Engines**: Tesseract.js, Google Vision API, Azure Cognitive Services
- **LLM Integration**: OpenAI GPT / Anthropic Claude for response generation

## 📁 Project Structure

```
advanced-rag-system/
├── server/
│   ├── index.js                 # Main server file
│   ├── processors/
│   │   └── documentProcessor.js # Document processing pipeline
│   ├── vector/
│   │   └── vectorStore.js       # Vector storage and search
│   ├── rag/
│   │   └── ragPipeline.js       # RAG query processing
│   └── evaluation/
│       └── metrics.js           # Performance evaluation
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Application header
│   │   ├── DocumentUpload.tsx   # File upload interface
│   │   ├── DocumentList.tsx     # Document management
│   │   ├── QueryInterface.tsx   # Query input and results
│   │   └── MetricsPanel.tsx     # Performance dashboard
│   ├── App.tsx                  # Main application component
│   └── main.tsx                 # Application entry point
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB instance
- API keys for external services (see Configuration)

### Installation

1. **Clone and Install**
```bash
git clone <repository>
cd advanced-rag-system
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000` with the API server running on `http://localhost:3001`.

## ⚙️ Configuration

### Required APIs

#### MongoDB Database
```env
MONGODB_URI=mongodb://localhost:27017/rag-system
```

#### Embedding Models
**Option 1: OpenAI Embeddings**
```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Option 2: HuggingFace Sentence Transformers**
```env
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

#### OCR Services
**Option 1: Google Vision API**
```env
GOOGLE_VISION_API_KEY=your_google_vision_api_key_here
```

**Option 2: Azure Cognitive Services**
```env
AZURE_COGNITIVE_SERVICES_KEY=your_azure_key_here
AZURE_COGNITIVE_SERVICES_ENDPOINT=your_azure_endpoint_here
```

**Option 3: Tesseract (Local)**
```env
TESSERACT_PATH=/usr/bin/tesseract
```

#### Vector Database (Production)
```env
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment
```

### Document Processing Pipeline

The system implements a sophisticated document processing pipeline:

1. **File Upload & Validation**
   - Multi-format support with type validation
   - File size limits and security checks

2. **Content Extraction**
   - PDF text and metadata extraction
   - OCR processing for images and scanned documents
   - Table structure recognition
   - Chart and visual element detection

3. **Intelligent Chunking**
   - Content-aware chunking strategies
   - Preservation of visual context
   - Metadata enrichment

4. **Vector Embedding**
   - Text embedding generation
   - Vector storage with metadata
   - Similarity indexing

5. **Quality Assessment**
   - OCR confidence scoring
   - Content quality metrics
   - Processing validation

### Query Processing

The RAG pipeline includes advanced query processing:

1. **Query Analysis**
   - Intent classification
   - Entity extraction
   - Keyword expansion

2. **Retrieval**
   - Vector similarity search
   - Contextual filtering
   - Multi-factor reranking

3. **Response Generation**
   - Context-aware LLM prompting
   - Source attribution
   - Confidence scoring

4. **Evaluation**
   - RAGAS metrics calculation
   - Performance monitoring
   - Quality assessment

## 📊 Evaluation Metrics

The system implements comprehensive evaluation using RAGAS methodology:

- **Faithfulness**: How grounded the response is in the retrieved context
- **Answer Relevancy**: How relevant the answer is to the user query
- **Context Recall**: How much relevant information was retrieved
- **Context Precision**: How precise the retrieved context is

Additional metrics include:
- Response latency
- Source relevance scoring
- OCR confidence levels
- Processing success rates

## 🔧 Customization

### Adding New Document Types
1. Extend `supportedTypes` in `documentProcessor.js`
2. Implement type-specific processing logic
3. Update chunking strategies as needed

### Custom Embedding Models
1. Modify `generateEmbeddings()` in `vectorStore.js`
2. Update embedding dimensions
3. Implement model-specific preprocessing

### Advanced OCR Integration
1. Add new OCR service to `documentProcessor.js`
2. Implement service-specific API calls
3. Update confidence calculation logic

## 🚀 Production Deployment

For production deployment:

1. **Database**: Replace in-memory vector store with Pinecone/Weaviate
2. **Scaling**: Implement Redis for caching and session management
3. **Security**: Add authentication and rate limiting
4. **Monitoring**: Integrate application performance monitoring
5. **Storage**: Use cloud storage for document files

## 📈 Performance Optimization

- **Caching**: Implement embedding caching for repeated queries
- **Batch Processing**: Process multiple documents simultaneously  
- **Lazy Loading**: Load document content on demand
- **Index Optimization**: Optimize vector similarity search
- **Resource Management**: Implement memory and CPU usage monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests and documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This is a comprehensive RAG system designed for production use. Ensure all API keys are properly configured and secured before deployment.