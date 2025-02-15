import React from "react";

type Props = { pdf_url: string };

const PDFViewer = ({ pdf_url }: Props) => {
  return (
    <div className="h-full bg-[#161B22]/70 backdrop-blur-sm rounded-lg border border-[#00FF9D]/20">
      <iframe
        src={`https://docs.google.com/gview?url=${pdf_url}&embedded=true`}
        className="w-full h-full rounded-lg"
      ></iframe>
    </div>
  );
};

export default PDFViewer;