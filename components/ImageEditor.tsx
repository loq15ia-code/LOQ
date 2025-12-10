import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { generateOrEditImage } from '../services/geminiService';
import { fileToBase64, fileToDataUrl } from '../utils/imageUtils';
import { AppStatus, ImageState, GenerationResult } from '../types';

export const ImageEditor: React.FC = () => {
  // Input State
  const [inputImage, setInputImage] = useState<ImageState>({
    file: null,
    previewUrl: null,
    base64: null,
    mimeType: null,
  });
  const [prompt, setPrompt] = useState('');
  
  // App State
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
      }

      try {
        const previewUrl = await fileToDataUrl(file);
        const base64 = await fileToBase64(file);
        
        setInputImage({
          file,
          previewUrl,
          base64,
          mimeType: file.type,
        });
        setError(null);
        setResult(null); // Clear previous result on new upload
      } catch (err) {
        console.error("Error processing file:", err);
        setError("Failed to process image file.");
      }
    }
  };

  const handleClearImage = () => {
    setInputImage({
      file: null,
      previewUrl: null,
      base64: null,
      mimeType: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setStatus(AppStatus.LOADING);
    setError(null);

    try {
      const { imageUrl, text } = await generateOrEditImage(
        prompt,
        inputImage.base64 || undefined,
        inputImage.mimeType || undefined
      );

      setResult({
        imageUrl,
        textResponse: text
      });
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setStatus(AppStatus.ERROR);
      setError(err.message || "An error occurred while generating the image.");
    }
  };

  const handleDownload = () => {
    if (result?.imageUrl) {
      const link = document.createElement('a');
      link.href = result.imageUrl;
      link.download = `banana-edit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Controls & Input */}
      <div className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            1. Upload Reference (Optional)
          </h2>
          
          <div 
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              inputImage.previewUrl 
                ? 'border-yellow-500/50 bg-zinc-800/30' 
                : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {inputImage.previewUrl ? (
              <div className="relative group">
                <img 
                  src={inputImage.previewUrl} 
                  alt="Preview" 
                  className="max-h-64 mx-auto rounded-md shadow-lg" 
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    type="button"
                    variant="danger" 
                    onClick={(e) => {
                      e.preventDefault(); 
                      handleClearImage();
                    }}
                    className="!p-2 text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pointer-events-none">
                <div className="mx-auto bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center text-zinc-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
                <p className="text-sm text-zinc-300 font-medium">Click or drag to upload an image</p>
                <p className="text-xs text-zinc-500">Supports JPG, PNG, WEBP</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm h-full">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            2. Describe Changes
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="prompt" className="sr-only">Prompt</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={inputImage.file ? "Ex: Add a retro filter, remove the background..." : "Ex: A banana with eyes, hands, and legs..."}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-white placeholder-zinc-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none h-32 transition-all"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {inputImage.file ? "Mode: Image Editing" : "Mode: Image Generation"}
              </span>
              <Button 
                type="submit" 
                variant="primary" 
                isLoading={status === AppStatus.LOADING}
                disabled={!prompt.trim()}
                className="w-full sm:w-auto"
              >
                {inputImage.file ? "Edit Image" : "Generate Image"}
              </Button>
            </div>
            
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-900/50 text-red-400 text-sm rounded-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Right Column: Output */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm min-h-[500px] flex flex-col">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Result
        </h2>

        <div className="flex-1 flex items-center justify-center bg-zinc-950/50 rounded-lg border border-zinc-800/50 relative overflow-hidden group">
          {status === AppStatus.LOADING ? (
            <div className="text-center space-y-4">
              <div className="inline-block animate-bounce">
                <span className="text-4xl">🍌</span>
              </div>
              <p className="text-zinc-400 text-sm animate-pulse">Peeling pixels...</p>
            </div>
          ) : result?.imageUrl ? (
            <div className="relative w-full h-full flex items-center justify-center p-4">
               <img 
                 src={result.imageUrl} 
                 alt="AI Generated" 
                 className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
               />
            </div>
          ) : (
             <div className="text-zinc-600 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                <p>Output will appear here</p>
             </div>
          )}
        </div>

        {result?.textResponse && (
           <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 text-zinc-300 text-sm">
              <p className="font-semibold text-zinc-400 mb-1 text-xs uppercase tracking-wider">Model Note</p>
              {result.textResponse}
           </div>
        )}

        {result?.imageUrl && (
          <div className="mt-4 flex justify-end">
            <Button variant="primary" onClick={handleDownload}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};