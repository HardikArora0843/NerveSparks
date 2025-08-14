import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';

export class VectorStore {
  constructor() {
    this.vectors = new Map();
    this.documents = new Map();
    this.initializeEmbeddingServices();
  }

  initializeEmbeddingServices() {
    // OpenAI embeddings (temporarily disabled due to quota issues)
    if (process.env.OPENAI_API_KEY && false) { // Disabled temporarily
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        console.log('✅ OpenAI embeddings initialized in VectorStore');
      } catch (error) {
        console.warn('⚠️ OpenAI VectorStore initialization failed:', error.message);
      }
    }

    // HuggingFace embeddings
    if (process.env.HUGGINGFACE_API_KEY) {
      try {
        this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
        console.log('✅ HuggingFace embeddings initialized in VectorStore');
      } catch (error) {
        console.warn('⚠️ HuggingFace VectorStore initialization failed:', error.message);
      }
    }
  }

  async storeDocument(documentId, processingResult) {
    try {
      const chunks = processingResult.chunks || [];
      
      console.log(`🔧 Storing document ${documentId} with ${chunks.length} chunks`);
      
      // Store document metadata
      this.documents.set(documentId.toString(), {
        id: documentId,
        metadata: processingResult.metadata,
        chunksCount: chunks.length,
        storedAt: new Date()
      });

      // Store chunks with embeddings
      for (let i = 0; i < chunks.length; i++) {
        const chunkId = `${documentId}_${i}`;
        const chunk = chunks[i];
        
        console.log(`📝 Processing chunk ${i}: "${chunk.content.substring(0, 100)}..."`);
        
        // Generate embedding if not already present
        if (!chunk.embedding) {
          chunk.embedding = await this.generateEmbedding(chunk.content);
        }
        
        // Validate embedding before storing
        if (!Array.isArray(chunk.embedding)) {
          console.error(`❌ Invalid embedding for chunk ${i}:`, chunk.embedding);
          chunk.embedding = this.simpleHashEmbedding(chunk.content);
        }
        
        console.log(`💾 Storing chunk ${i} with embedding: ${Array.isArray(chunk.embedding) ? chunk.embedding.length : 'invalid'} dimensions`);
        
        this.vectors.set(chunkId, {
          id: chunkId,
          documentId: documentId.toString(),
          chunkId: i,
          content: chunk.content,
          metadata: chunk.metadata,
          type: chunk.type,
          embedding: chunk.embedding,
          embeddingModel: chunk.embeddingModel || 'fallback'
        });
      }

      console.log(`✅ Stored ${chunks.length} chunks with embeddings for document ${documentId}`);
      console.log(`📊 Total vectors in store: ${this.vectors.size}`);
      return { success: true, chunksStored: chunks.length };
    } catch (error) {
      console.error('Vector store error:', error);
      throw error;
    }
  }

  async generateEmbedding(text) {
    try {
      console.log(`🔧 Generating embedding for text: "${text.substring(0, 50)}..."`);
      
      if (this.openai && false) { // Disabled temporarily due to quota issues
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: text
        });
        return response.data[0].embedding;
      } else if (this.hf) {
        try {
          const response = await this.hf.featureExtraction({
            model: 'sentence-transformers/all-MiniLM-L6-v2',
            inputs: text
          });
          
          // Ensure we get a proper array
          let embedding = response[0];
          if (!Array.isArray(embedding)) {
            console.warn('HuggingFace returned non-array embedding, converting...');
            embedding = Array.from(embedding || []);
          }
          
          console.log(`✅ HuggingFace embedding generated: ${embedding.length} dimensions`);
          return embedding;
        } catch (hfError) {
          console.warn('HuggingFace embedding failed, using fallback:', hfError.message);
          const fallback = this.simpleHashEmbedding(text);
          console.log(`✅ Fallback embedding generated: ${Array.isArray(fallback) ? fallback.length : 'not array'} dimensions`);
          return fallback;
        }
      } else {
        // Fallback to simple hash-based embedding
        const fallback = this.simpleHashEmbedding(text);
        console.log(`✅ Simple embedding generated: ${Array.isArray(fallback) ? fallback.length : 'not array'} dimensions`);
        return fallback;
      }
    } catch (error) {
      console.warn('Embedding generation failed, using fallback:', error.message);
      const fallback = this.simpleHashEmbedding(text);
      console.log(`✅ Emergency fallback embedding: ${Array.isArray(fallback) ? fallback.length : 'not array'} dimensions`);
      return fallback;
    }
  }

  simpleHashEmbedding(text) {
    // Simple hash-based embedding for fallback
    if (!text || typeof text !== 'string') {
      console.warn('Invalid text for embedding, using default');
      text = 'default text';
    }
    
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const embedding = new Array(384).fill(0);
    
    for (const word of words) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash) + word.charCodeAt(i);
        hash = hash & hash;
      }
      const index = Math.abs(hash) % 384;
      embedding[index] += 1;
    }
    
    // Add character-level features
    for (let i = 0; i < Math.min(text.length, 100); i++) {
      const charCode = text.charCodeAt(i);
      const index = (charCode * i) % 384;
      embedding[index] += 0.1;
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) {
      // Fallback for empty text
      embedding[0] = 1;
    } else {
      // Normalize the embedding
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] = embedding[i] / magnitude;
      }
    }
    
    console.log(`🔧 Simple embedding created: ${embedding.length} dimensions, first 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(3)).join(', ')}]`);
    return embedding;
  }

  async searchWithEmbedding(queryEmbedding, documentIds = null, filters = {}) {
    const results = [];
    const minSimilarity = filters.minSimilarity || 0.1;
    const topK = filters.topK || 10;

    console.log(`🔍 Searching ${this.vectors.size} vectors with minSimilarity: ${minSimilarity}`);
    console.log(`📋 Document filter: ${documentIds ? documentIds.join(', ') : 'all documents'}`);

    for (const [chunkId, vector] of this.vectors) {
      // Filter by document IDs if specified
      if (documentIds && !documentIds.includes(vector.documentId)) {
        continue;
      }

      // Calculate cosine similarity
      const similarity = this.calculateCosineSimilarity(queryEmbedding, vector.embedding);
      
      if (similarity >= minSimilarity) {
        results.push({
          ...vector,
          similarity
        });
        console.log(`✅ Found match: ${similarity.toFixed(3)} - "${vector.content.substring(0, 50)}..."`);
      }
    }

    console.log(`📊 Search results: ${results.length} chunks found`);
    
    // Sort by similarity and return top results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  async searchWithQuery(query, documentIds = null, filters = {}) {
    // Generate embedding for the query
    const queryEmbedding = await this.generateEmbedding(query);
    
    // Use embedding-based search
    return this.searchWithEmbedding(queryEmbedding, documentIds, filters);
  }

  calculateCosineSimilarity(vec1, vec2) {
    // Validate inputs
    if (!vec1 || !vec2) {
      console.warn('Missing vectors for similarity calculation');
      return 0;
    }
    
    // Ensure vectors are arrays
    if (!Array.isArray(vec1) || !Array.isArray(vec2)) {
      console.warn('Vectors are not arrays:', { 
        vec1Type: typeof vec1, 
        vec2Type: typeof vec2,
        vec1: vec1,
        vec2: vec2
      });
      return 0;
    }
    
    // Ensure vectors have the same length by padding or truncating
    const maxLength = Math.max(vec1.length, vec2.length);
    const normalizedVec1 = [...vec1];
    const normalizedVec2 = [...vec2];
    
    // Pad shorter vector with zeros
    while (normalizedVec1.length < maxLength) normalizedVec1.push(0);
    while (normalizedVec2.length < maxLength) normalizedVec2.push(0);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < maxLength; i++) {
      dotProduct += normalizedVec1[i] * normalizedVec2[i];
      norm1 += normalizedVec1[i] * normalizedVec1[i];
      norm2 += normalizedVec2[i] * normalizedVec2[i];
    }
    
    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    if (denominator === 0) {
      console.warn('Zero denominator in similarity calculation');
      return 0;
    }
    
    const similarity = dotProduct / denominator;
    console.log(`🔍 Similarity calculated: ${similarity.toFixed(4)}`);
    return similarity;
  }

  // Legacy method for backward compatibility
  simpleHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  calculateSimilarity(query, content, queryHash, contentHash) {
    // Simple similarity based on:
    // 1. Hash similarity
    // 2. Word overlap
    // 3. Content length similarity
    
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const contentWords = new Set(content.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...queryWords].filter(x => contentWords.has(x)));
    const union = new Set([...queryWords, ...contentWords]);
    
    const jaccardSimilarity = intersection.size / union.size;
    const hashSimilarity = 1 - Math.abs(queryHash - contentHash) / Math.max(queryHash, contentHash);
    
    return (jaccardSimilarity * 0.7) + (hashSimilarity * 0.3);
  }

  // Get statistics about the vector store
  getStats() {
    return {
      totalVectors: this.vectors.size,
      totalDocuments: this.documents.size,
      averageChunksPerDocument: this.documents.size > 0 ? 
        this.vectors.size / this.documents.size : 0,
      embeddingModels: this.getEmbeddingModelStats()
    };
  }

  getEmbeddingModelStats() {
    const modelCounts = {};
    for (const vector of this.vectors.values()) {
      const model = vector.embeddingModel || 'unknown';
      modelCounts[model] = (modelCounts[model] || 0) + 1;
    }
    return modelCounts;
  }

  // Clear all data (useful for testing)
  clear() {
    this.vectors.clear();
    this.documents.clear();
  }
}