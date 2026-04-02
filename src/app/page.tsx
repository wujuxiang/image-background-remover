"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";

type ProcessingState = "idle" | "uploading" | "processing" | "success" | "error";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalImage(dataUrl);
      setResultImage(null);
      setProcessingState("uploading");
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("image_file", file);

      try {
        setProcessingState("processing");
        const response = await fetch("/api/remove-bg", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to process image");
        }

        setResultImage(data.data);
        setProcessingState("success");
      } catch (error) {
        console.error("Process error:", error);
        setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
        setProcessingState("error");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file (JPG, PNG, WebP)");
      setProcessingState("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 10MB");
      setProcessingState("error");
      return;
    }
    processImage(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = "removed-background.png";
    link.click();
  };

  const reset = () => {
    setOriginalImage(null);
    setResultImage(null);
    setProcessingState("idle");
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <h1 className="text-xl font-semibold text-white">BG Remover</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-12">
        {/* Upload Area */}
        {processingState === "idle" && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 ${
              isDragging
                ? "border-purple-400 bg-purple-500/20"
                : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
            }`}
          >
            <div className="flex flex-col items-center justify-center py-24">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20">
                <svg
                  className="h-8 w-8 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="mb-2 text-lg font-medium text-white">
                Drop your image here
              </p>
              <p className="text-sm text-white/60">
                or click to select · JPG, PNG, WebP · Max 10MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        )}

        {/* Processing State */}
        {(processingState === "uploading" || processingState === "processing") && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="mb-6 relative">
              {originalImage && (
                <div className="h-32 w-32 rounded-xl overflow-hidden checkerboard">
                  <Image
                    src={originalImage}
                    alt="Original"
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-32 rounded-xl border-2 border-purple-400 animate-pulse" />
              </div>
            </div>
            <p className="text-lg font-medium text-white">
              {processingState === "uploading" ? "Uploading..." : "Removing background..."}
            </p>
            <p className="mt-2 text-sm text-white/60">
              This usually takes 2-3 seconds
            </p>
            <button
              onClick={reset}
              className="mt-6 text-sm text-white/40 hover:text-white/60 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Result */}
        {processingState === "success" && resultImage && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">Result</h2>
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                >
                  Upload New
                </button>
                <button
                  onClick={downloadResult}
                  className="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PNG
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Original */}
              <div>
                <p className="mb-2 text-sm text-white/60">Original</p>
                <div className="relative overflow-hidden rounded-xl bg-white/5">
                  <div className="aspect-square checkerboard flex items-center justify-center">
                    <Image
                      src={originalImage!}
                      alt="Original"
                      width={512}
                      height={512}
                      className="max-h-96 w-auto object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Result */}
              <div>
                <p className="mb-2 text-sm text-white/60">Background Removed</p>
                <div className="relative overflow-hidden rounded-xl bg-white/5">
                  <div className="aspect-square checkerboard flex items-center justify-center">
                    <Image
                      src={resultImage}
                      alt="Result"
                      width={512}
                      height={512}
                      className="max-h-96 w-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {processingState === "error" && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="mb-2 text-lg font-medium text-white">Something went wrong</p>
            <p className="text-sm text-red-400">{errorMessage}</p>
            <button
              onClick={reset}
              className="mt-6 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-white/40">
          No images are stored · Built with Next.js & Tailwind CSS
        </div>
      </footer>
    </div>
  );
}
