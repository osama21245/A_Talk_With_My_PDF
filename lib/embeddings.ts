import { Pinecone } from '@pinecone-database/pinecone';

// Initialize a Pinecone client with your API key
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

const model = 'multilingual-e5-large';

export async function getEmbeddings(text: string): Promise<number[]> {
  try {
    const embeddings = await pinecone.inference.embed(
      model,
      [text],
      { inputType: 'passage', truncate: 'END' }
    );

    // Check if embeddings are defined and return the first embedding's values
    if (embeddings && embeddings[0] && embeddings[0].values) {
      return embeddings[0].values;
    } else {
      throw new Error("Embeddings are undefined or empty");
    }
  } catch (error) {
    console.error("Error generating embeddings with Pinecone:", error);
    throw error;
  }
}