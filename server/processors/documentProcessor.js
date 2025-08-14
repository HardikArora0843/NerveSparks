import pdfParse from 'pdf-parse';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { CognitiveServicesCredentials } from '@azure/ms-rest-azure-js';
import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';

export class DocumentProcessor {
  constructor() {
    this.supportedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/tiff',
      'image/bmp',
      'image/webp'
    ];
    
    // Initialize all available services
    this.initializeServices();
  }

  initializeServices() {
    // Initialize OCR services
    this.initializeOCRServices();
    
    // Initialize embedding services
    this.initializeEmbeddingServices();
    
    // Initialize LLM services for content analysis
    this.initializeLLMServices();
  }

  initializeOCRServices() {
    // Google Vision API
    if (process.env.GOOGLE_VISION_API_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        this.googleVision = new ImageAnnotatorClient({
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          apiKey: process.env.GOOGLE_VISION_API_KEY
        });
        console.log('✅ Google Vision API initialized');
      } catch (error) {
        console.warn('⚠️ Google Vision API initialization failed:', error.message);
      }
    }

    // Azure Cognitive Services
    if (process.env.AZURE_COGNITIVE_SERVICES_KEY && process.env.AZURE_COGNITIVE_SERVICES_ENDPOINT) {
      try {
        const credentials = new CognitiveServicesCredentials(process.env.AZURE_COGNITIVE_SERVICES_KEY);
        this.azureVision = new ComputerVisionClient(credentials, process.env.AZURE_COGNITIVE_SERVICES_ENDPOINT);
        console.log('✅ Azure Cognitive Services initialized');
      } catch (error) {
        console.warn('⚠️ Azure Cognitive Services initialization failed:', error.message);
      }
    }

    // Tesseract (local fallback)
    this.tesseractWorker = null;
    console.log('✅ Tesseract.js available as fallback');
  }

  initializeEmbeddingServices() {
    // OpenAI embeddings (temporarily disabled due to quota issues)
    if (process.env.OPENAI_API_KEY && false) { // Disabled temporarily
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        console.log('✅ OpenAI embeddings initialized');
      } catch (error) {
        console.warn('⚠️ OpenAI initialization failed:', error.message);
      }
    }

    // HuggingFace embeddings
    if (process.env.HUGGINGFACE_API_KEY) {
      try {
        this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
        console.log('✅ HuggingFace embeddings initialized');
      } catch (error) {
        console.warn('⚠️ HuggingFace initialization failed:', error.message);
      }
    }
  }

  initializeLLMServices() {
    // OpenAI LLM for content analysis (temporarily disabled due to quota issues)
    if (process.env.OPENAI_API_KEY && !this.openai && false) { // Disabled temporarily
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
      } catch (error) {
        console.warn('⚠️ OpenAI LLM initialization failed:', error.message);
      }
    }

    // HuggingFace LLM for content analysis
    if (process.env.HUGGINGFACE_API_KEY && !this.hf) {
      try {
        this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
      } catch (error) {
        console.warn('⚠️ HuggingFace LLM initialization failed:', error.message);
      }
    }
  }

  async processDocument(file) {
    const { mimetype, buffer, originalname } = file;
    
    if (!this.supportedTypes.includes(mimetype)) {
      throw new Error(`Unsupported file type: ${mimetype}`);
    }

    try {
      console.log(`Processing document: ${originalname} (${mimetype})`);
      let processingResult;

      if (mimetype === 'application/pdf') {
        processingResult = await this.processPDF(buffer);
      } else if (mimetype.startsWith('image/')) {
        processingResult = await this.processImage(buffer, mimetype);
      }

      // Generate embeddings for chunks
      if (processingResult.chunks && processingResult.chunks.length > 0) {
        processingResult.chunks = await this.generateEmbeddings(processingResult.chunks);
      }

      return {
        filename: originalname,
        type: mimetype,
        processedAt: new Date(),
        ...processingResult
      };
    } catch (error) {
      console.error('Document processing error:', error);
      throw new Error(`Failed to process document: ${error.message}`);
    }
  }

  async processPDF(buffer) {
    try {
      const pdfData = await pdfParse(buffer);
      
      // Extract text content
      const textContent = pdfData.text;
      
      // Extract tables using advanced detection
      const tables = await this.extractTablesAdvanced(textContent);
      
      // Extract images (if any)
      const images = await this.extractPDFImages(buffer);
      
      // Split into pages
      const pages = this.splitIntoPages(textContent);
      
      // Create intelligent chunks
      const chunks = await this.createIntelligentChunks(textContent, 'pdf', {
        tables,
        images,
        pageCount: pdfData.numpages
      });
      
      return {
        totalPages: pdfData.numpages,
        textContent: textContent,
        pages: pages,
        chunks: chunks,
        tables: tables,
        images: images,
        metadata: {
          hasTables: tables.length > 0,
          hasImages: images.length > 0,
          wordCount: textContent.split(/\s+/).length,
          pageCount: pdfData.numpages,
          tableCount: tables.length,
          imageCount: images.length
        }
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
  }

  async processImage(buffer, mimetype) {
    try {
      // Try Google Vision API first
      let ocrText = '';
      let tableData = [];
      let imageAnalysis = {};

      if (this.googleVision) {
        try {
          const [result] = await this.googleVision.documentTextDetection(buffer);
          ocrText = result.fullTextAnnotation?.text || '';
          
          // Extract table data from Google Vision
          if (result.fullTextAnnotation?.pages) {
            tableData = this.extractTablesFromGoogleVision(result.fullTextAnnotation);
          }
          
          // Get image analysis
          const [analysis] = await this.googleVision.annotateImage({
            image: { content: buffer.toString('base64') },
            features: [
              { type: 'LABEL_DETECTION' },
              { type: 'TEXT_DETECTION' },
              { type: 'OBJECT_LOCALIZATION' }
            ]
          });
          
          imageAnalysis = {
            labels: analysis.labelAnnotations?.map(label => label.description) || [],
            objects: analysis.localizedObjectAnnotations?.map(obj => obj.name) || []
          };
          
          console.log('✅ Google Vision processing completed');
        } catch (error) {
          console.warn('⚠️ Google Vision failed, trying Azure:', error.message);
        }
      }

      // Try Azure Cognitive Services if Google Vision failed
      if (!ocrText && this.azureVision) {
        try {
          const result = await this.azureVision.recognizePrintedTextInStream(buffer);
          ocrText = result.regions?.map(region => 
            region.lines?.map(line => 
              line.words?.map(word => word.text).join(' ')
            ).join(' ')
          ).join(' ') || '';
          
          console.log('✅ Azure Cognitive Services processing completed');
        } catch (error) {
          console.warn('⚠️ Azure Cognitive Services failed, using Tesseract:', error.message);
        }
      }

      // Fallback to Tesseract
      if (!ocrText) {
        ocrText = await this.performOCR(buffer);
        console.log('✅ Tesseract OCR processing completed');
      }

      // Create intelligent chunks
      const chunks = await this.createIntelligentChunks(ocrText, 'image', {
        tables: tableData,
        imageAnalysis,
        imageType: mimetype
      });
      
      return {
        textContent: ocrText,
        chunks: chunks,
        tables: tableData,
        imageAnalysis: imageAnalysis,
        metadata: {
          hasTables: tableData.length > 0,
          hasImages: true,
          wordCount: ocrText.split(/\s+/).length,
          imageType: mimetype,
          ocrConfidence: this.calculateOCRConfidence(ocrText),
          labels: imageAnalysis.labels || [],
          objects: imageAnalysis.objects || []
        }
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  async performOCR(imageBuffer) {
    try {
      // Initialize Tesseract worker if not already done
      if (!this.tesseractWorker) {
        this.tesseractWorker = await createWorker('eng');
      }

      // Perform OCR
      const { data: { text } } = await this.tesseractWorker.recognize(imageBuffer);
      return text;
    } catch (error) {
      console.error('OCR error:', error);
      return '';
    }
  }

  extractTablesFromGoogleVision(fullTextAnnotation) {
    const tables = [];
    const pages = fullTextAnnotation.pages || [];
    
    for (const page of pages) {
      const blocks = page.blocks || [];
      for (const block of blocks) {
        if (block.blockType === 'TABLE') {
          const tableData = this.parseGoogleVisionTable(block);
          if (tableData.rows.length > 0) {
            tables.push(tableData);
          }
        }
      }
    }
    
    return tables;
  }

  parseGoogleVisionTable(block) {
    const table = {
      content: '',
      rows: [],
      columns: 0
    };
    
    // Parse table structure from Google Vision response
    // This is a simplified implementation
    const words = block.words || [];
    const lines = [];
    let currentLine = [];
    
    for (const word of words) {
      currentLine.push(word.text);
      if (word.boundingBox.vertices[0].y !== word.boundingBox.vertices[1].y) {
        lines.push(currentLine.join(' '));
        currentLine = [];
      }
    }
    
    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '));
    }
    
    table.rows = lines;
    table.content = lines.join('\n');
    table.columns = Math.max(...lines.map(line => line.split(/\s+/).length));
    
    return table;
  }

  async extractTablesAdvanced(textContent) {
    const tables = [];
    
    // Use LLM to identify and extract tables if available
    if (this.openai || this.hf) {
      try {
        const tableExtraction = await this.extractTablesWithLLM(textContent);
        tables.push(...tableExtraction);
      } catch (error) {
        console.warn('LLM table extraction failed, using pattern matching:', error.message);
      }
    }
    
    // Fallback to pattern matching
    const patternTables = this.extractTablesWithPatterns(textContent);
    tables.push(...patternTables);
    
    return tables;
  }

  async extractTablesWithLLM(textContent) {
    const prompt = `Extract all tables from the following text. Return only the table data in a structured format:

Text:
${textContent.substring(0, 2000)}

Please identify and extract any tables, charts, or structured data.`;

    try {
      if (this.openai && false) { // Disabled temporarily due to quota issues
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a data extraction specialist. Extract tables and structured data from text.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        });
        
        const extractedText = response.choices[0].message.content;
        return this.parseLLMTableResponse(extractedText);
      }
    } catch (error) {
      console.error('OpenAI table extraction failed:', error);
    }
    
    return [];
  }

  parseLLMTableResponse(response) {
    // Parse LLM response to extract table data
    const tables = [];
    const lines = response.split('\n');
    let currentTable = [];
    
    for (const line of lines) {
      if (line.includes('|') || line.includes('\t') || line.match(/\s{3,}/)) {
        currentTable.push(line);
      } else if (currentTable.length > 0) {
        if (currentTable.length > 1) {
          tables.push({
            content: currentTable.join('\n'),
            rows: currentTable.length,
            columns: Math.max(...currentTable.map(row => row.split(/\s+/).length))
          });
        }
        currentTable = [];
      }
    }
    
    return tables;
  }

  extractTablesWithPatterns(textContent) {
    const tables = [];
    const lines = textContent.split('\n');
    let currentTable = [];
    let inTable = false;

    for (const line of lines) {
      if (this.isTableRow(line)) {
        if (!inTable) {
          inTable = true;
          currentTable = [];
        }
        currentTable.push(line);
      } else {
        if (inTable && currentTable.length > 0) {
          tables.push({
            content: currentTable.join('\n'),
            rows: currentTable.length,
            columns: Math.max(...currentTable.map(row => row.split(/\s+/).length))
          });
          currentTable = [];
          inTable = false;
        }
      }
    }

    return tables;
  }

  async createIntelligentChunks(textContent, type, metadata) {
    const chunks = [];
    
    console.log(`🔧 Creating chunks for ${textContent.length} characters of text`);
    
    // Split into sentences first
    const sentences = this.splitIntoSentences(textContent);
    console.log(`📝 Split into ${sentences.length} sentences`);
    
    // Create semantic chunks using LLM if available
    if (this.openai || this.hf) {
      try {
        const semanticChunks = await this.createSemanticChunks(sentences, type, metadata);
        chunks.push(...semanticChunks);
        console.log(`🧠 Created ${semanticChunks.length} semantic chunks`);
      } catch (error) {
        console.warn('Semantic chunking failed, using basic chunking:', error.message);
      }
    }
    
    // Fallback to basic chunking
    if (chunks.length === 0) {
      const basicChunks = this.createBasicChunks(sentences, type, metadata);
      chunks.push(...basicChunks);
      console.log(`📄 Created ${basicChunks.length} basic chunks`);
    }
    
    console.log(`✅ Total chunks created: ${chunks.length}`);
    return chunks;
  }

  async createSemanticChunks(sentences, type, metadata) {
    const chunks = [];
    let currentChunk = [];
    let chunkId = 0;
    
    for (const sentence of sentences) {
      currentChunk.push(sentence);
      
      // If chunk is getting long, analyze if it should be split
      if (currentChunk.join(' ').length > 400) {
        const chunkText = currentChunk.join(' ');
        
        // Use LLM to determine if this is a good break point
        const shouldSplit = await this.analyzeChunkBreakpoint(chunkText);
        
        if (shouldSplit && currentChunk.length > 1) {
          // Remove last sentence and create chunk
          const lastSentence = currentChunk.pop();
          chunks.push({
            id: chunkId++,
            content: currentChunk.join(' '),
            type: type,
            metadata: {
              ...metadata,
              sentenceCount: currentChunk.length,
              semanticChunk: true
            }
          });
          currentChunk = [lastSentence];
        }
      }
    }
    
    // Add remaining content
    if (currentChunk.length > 0) {
      chunks.push({
        id: chunkId++,
        content: currentChunk.join(' '),
        type: type,
        metadata: {
          ...metadata,
          sentenceCount: currentChunk.length,
          semanticChunk: true
        }
      });
    }
    
    return chunks;
  }

  async analyzeChunkBreakpoint(chunkText) {
    try {
      if (this.openai && false) { // Disabled temporarily due to quota issues
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a text chunking specialist. Determine if the given text represents a complete semantic unit.'
            },
            {
              role: 'user',
              content: `Does this text represent a complete semantic unit that should be kept together as one chunk? Answer with just "yes" or "no":\n\n${chunkText}`
            }
          ],
          max_tokens: 10,
          temperature: 0.1
        });
        
        return response.choices[0].message.content.toLowerCase().includes('yes');
      }
    } catch (error) {
      console.error('Chunk analysis failed:', error);
    }
    
    return false;
  }

  createBasicChunks(sentences, type, metadata) {
    const chunks = [];
    let currentChunk = '';
    let chunkId = 0;

    console.log(`📄 Creating basic chunks from ${sentences.length} sentences`);

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > 500) {
        if (currentChunk.trim().length > 0) {
          chunks.push({
            id: chunkId++,
            content: currentChunk.trim(),
            type: type,
            metadata: {
              ...metadata,
              sentenceCount: currentChunk.split(/[.!?]+/).length - 1
            }
          });
          console.log(`📝 Created chunk ${chunkId-1}: "${currentChunk.trim().substring(0, 50)}..."`);
        }
        currentChunk = sentence;
      } else {
        currentChunk += ' ' + sentence;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push({
        id: chunkId++,
        content: currentChunk.trim(),
        type: type,
        metadata: {
          ...metadata,
          sentenceCount: currentChunk.split(/[.!?]+/).length - 1
        }
      });
      console.log(`📝 Created final chunk ${chunkId-1}: "${currentChunk.trim().substring(0, 50)}..."`);
    }

    console.log(`✅ Basic chunking complete: ${chunks.length} chunks created`);
    return chunks;
  }

  async generateEmbeddings(chunks) {
    for (const chunk of chunks) {
      try {
        if (this.openai && false) { // Disabled temporarily due to quota issues
          const response = await this.openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: chunk.content
          });
          chunk.embedding = response.data[0].embedding;
          chunk.embeddingModel = 'text-embedding-ada-002';
        } else if (this.hf) {
          const response = await this.hf.featureExtraction({
            model: 'sentence-transformers/all-MiniLM-L6-v2',
            inputs: chunk.content
          });
          chunk.embedding = response[0];
          chunk.embeddingModel = 'sentence-transformers/all-MiniLM-L6-v2';
        }
      } catch (error) {
        console.warn(`Failed to generate embedding for chunk ${chunk.id}:`, error.message);
      }
    }
    
    return chunks;
  }

  splitIntoPages(textContent) {
    const pageBreaks = textContent.split(/\f|\n\s*\n\s*\n/);
    return pageBreaks.map((page, index) => ({
      pageNumber: index + 1,
      content: page.trim(),
      wordCount: page.split(/\s+/).length
    })).filter(page => page.content.length > 0);
  }

  splitIntoSentences(text) {
    // Improved sentence splitting
    const sentences = text
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10); // Filter out very short fragments
    
    console.log(`🔤 Split text into ${sentences.length} sentences`);
    if (sentences.length > 0) {
      console.log(`📝 First sentence: "${sentences[0].substring(0, 100)}..."`);
    }
    
    return sentences;
  }

  isTableRow(line) {
    const trimmed = line.trim();
    if (trimmed.length === 0) return false;
    
    if (trimmed.includes('|') && trimmed.split('|').length > 2) return true;
    if (trimmed.includes('\t') && trimmed.split('\t').length > 2) return true;
    
    const spaceGroups = trimmed.split(/\s{2,}/);
    if (spaceGroups.length > 2) return true;
    
    return false;
  }

  calculateOCRConfidence(text) {
    // Simple confidence calculation based on text quality
    const words = text.split(/\s+/);
    const validWords = words.filter(word => word.length > 1 && /^[a-zA-Z0-9\s]+$/.test(word));
    return validWords.length / Math.max(words.length, 1);
  }

  async extractPDFImages(buffer) {
    // This would require more complex PDF processing
    // For now, return empty array
    return [];
  }
}