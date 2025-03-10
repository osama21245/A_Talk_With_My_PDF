// import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
// import { downloadFromS3 } from "./s3-server";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import md5 from "md5";
// import {
//   Document,
//   RecursiveCharacterTextSplitter,
// } from "@pinecone-database/doc-splitter";
// import { getEmbeddings } from "./embeddings";
// import { convertToAscii } from "./utils";

// export const getPineconeClient = () => {
//   return new Pinecone({
//     apiKey: process.env.PINECONE_API_KEY!,
//   });
// };

// type PDFPage = {
//   pageContent: string;
//   metadata: {
//     loc: { pageNumber: number };
//   };
// };

// export async function loadS3IntoPinecone(fileKey: string) {
//   // 1. obtain the pdf -> downlaod and read from pdf
//   console.log("downloading s3 into file system");
//   const file_name = await downloadFromS3(fileKey);
//   if (!file_name) {
//     throw new Error("could not download from s3");
//   }
//   console.log("loading pdf into memory" + file_name);
//   const loader = new PDFLoader(file_name);
//   const pages = (await loader.load()) as PDFPage[];

//   // 2. split and segment the pdf
//   const documents = await Promise.all(pages.map(prepareDocument));

//   // 3. vectorise and embed individual documents
//   const vectors = await Promise.all(documents.flat().map(embedDocument));

//   // 4. upload to pinecone
//   const client = await getPineconeClient();
//   const pineconeIndex = await client.index("a-talk-with-my-pdf");
//   const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

//   console.log("inserting vectors into pinecone");
//   await namespace.upsert(vectors);

//   return documents[0];
// }

// async function embedDocument(doc: Document) {
//   try {
//     const embeddings = await getEmbeddings(doc.pageContent);
//     const hash = md5(doc.pageContent);

//     return {
//       id: hash,
//       values: embeddings,
//       metadata: {
//         text: doc.metadata.text,
//         pageNumber: doc.metadata.pageNumber,
//       },
//     } as PineconeRecord;
//   } catch (error) {
//     console.log("error embedding document", error);
//     throw error;
//   }
// }

// export const truncateStringByBytes = (str: string, bytes: number) => {
//   const enc = new TextEncoder();
//   return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
// };

// async function prepareDocument(page: PDFPage) {
//   let { pageContent, metadata } = page;
//   pageContent = pageContent.replace(/\n/g, "");
//   // split the docs
//   const splitter = new RecursiveCharacterTextSplitter();
//   const docs = await splitter.splitDocuments([
//     new Document({
//       pageContent,
//       metadata: {
//         pageNumber: metadata.loc.pageNumber,
//         text: truncateStringByBytes(pageContent, 36000),
//       },
//     }),
//   ]);
//   return docs;
// }






import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import md5 from "md5";
import { Document, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const model = 'multilingual-e5-large';

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

async function prepareDocument(page: PDFPage) {
  const splitter = new RecursiveCharacterTextSplitter();
  return splitter.splitDocuments([
    new Document({
      pageContent: page.pageContent.replace(/\n/g, ""),
      metadata: {
        pageNumber: page.metadata.loc.pageNumber,
        text: page.pageContent.slice(0, 36000),
      },
    }),
  ]);
}

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. Load PDF
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) throw new Error("could not download from s3");
  const loader = new PDFLoader(file_name);
  const pages = await loader.load() as PDFPage[];

  // 2. Split into chunks
  const documents = await Promise.all(pages.map(prepareDocument));
  const flatDocs = documents.flat();

  // 3. Generate embeddings
  const vectors = await Promise.all(
    flatDocs.map(async (doc) => {
      const embedding = await pinecone.inference.embed(
        model,
        [doc.pageContent],
        { inputType: 'passage', truncate: 'END' }
      );

      return {
        id: md5(doc.pageContent),
        values: embedding[0].values,
        metadata: {
          text: doc.metadata.text,
          pageNumber: doc.metadata.pageNumber,
        },
      } as PineconeRecord;
    })
  );

  // 4. Store in Pinecone
  const index = pinecone.index(process.env.NEXT_PUBLIC_S3_BUCKET_NAME!);
  await index.namespace(fileKey.replace(/[^\x00-\x7F]/g, "")).upsert(vectors);

  return documents[0];
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};