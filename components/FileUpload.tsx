"use client";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Loader2, FileText } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// https://github.com/aws/aws-sdk-js-v3/issues/4126

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const { mutate } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        // bigger than 10mb!
        toast.error("File too large");
        return;
      }

      try {
        setUploading(true);
        const data = await uploadToS3(file);
        console.log("meow", data);
        if (!data?.file_key || !data.file_name) {
          toast.error("Something went wrong");
          setUploading(false);
          return;
        }
        mutate(data, {
          onSuccess: ({ chat_id }) => {
            toast.success("Chat created!");
            router.push(`/chat/${chat_id}`);
            setUploading(false);
          },
          onError: (err) => {
            toast.error("Error creating chat");
            console.error(err);
            setUploading(false);
          },
        });
      } catch (error) {
        console.log(error);
        setUploading(false);
      }
    },
  });
  return (
    <div>
    {uploading && (
      <div className="flex flex-col gap-2 items-center justify-center w-full h-64 bg-[#0D1117] rounded-lg border-2 border-dashed border-[#00FF9D]/30">
        <Loader2 className="w-8 h-8 animate-spin text-[#00FF9D]" />
        <div className="text-[#00FF9D]">Uploading...</div>
      </div>
    )}
    {!uploading && (
      <div
        className={`flex flex-col items-center justify-center w-full h-64 ${
          isDragActive
            ? "bg-[#161B22] border-[#00FF9D]"
            : "bg-[#0D1117] border-[#00FF9D]/30"
        } rounded-lg border-2 border-dashed transition-colors duration-200 cursor-pointer`}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <FileText className={`w-8 h-8 ${isDragActive ? "text-[#00FF9D]" : "text-[#00FF9D]/70"}`} />
          <div className={`${isDragActive ? "text-[#00FF9D]" : "text-[#00FF9D]/70"} text-sm`}>
            Drop your PDF here or click to browse
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default FileUpload;