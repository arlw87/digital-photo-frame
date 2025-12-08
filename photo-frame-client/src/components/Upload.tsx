import React, { useState, useRef } from 'react';
import { pb } from '../lib/pocketbase';

import heic2any from 'heic2any';

interface ImagePreview {
    file: File;
    preview: string;
    name: string;
    tags: string;
}

export function Upload() {
    const [images, setImages] = useState<ImagePreview[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [converting, setConverting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        addFiles(files);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            addFiles(files);
        }
    };

    const addFiles = async (files: File[]) => {
        setConverting(true);
        setError('');

        try {
            const processedFiles: ImagePreview[] = [];

            for (const file of files) {
                // Skip non-image files
                if (!file.type.startsWith('image/') && !file.name.toLowerCase().endsWith('.heic')) continue;

                let finalFile = file;
                let finalName = file.name;

                // Convert HEIC to JPEG
                if (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') {
                    try {
                        const convertedBlob = await heic2any({
                            blob: file,
                            toType: 'image/jpeg',
                            quality: 0.8
                        });

                        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                        finalName = file.name.replace(/\.heic$/i, '.jpg');
                        finalFile = new File([blob], finalName, { type: 'image/jpeg' });
                    } catch (err) {
                        console.error('Error converting HEIC:', err);
                        setError('Failed to convert some HEIC images.');
                        continue;
                    }
                }

                processedFiles.push({
                    file: finalFile,
                    preview: URL.createObjectURL(finalFile),
                    name: finalName,
                    tags: ''
                });
            }

            setImages(prev => [...prev, ...processedFiles]);
        } catch (err) {
            console.error(err);
            setError('Error processing files');
        } finally {
            setConverting(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => {
            const newImages = [...prev];
            URL.revokeObjectURL(newImages[index].preview);
            newImages.splice(index, 1);
            return newImages;
        });
    };

    const updateImageName = (index: number, name: string) => {
        setImages(prev => {
            const newImages = [...prev];
            newImages[index].name = name;
            return newImages;
        });
    };

    const updateImageTags = (index: number, tags: string) => {
        setImages(prev => {
            const newImages = [...prev];
            newImages[index].tags = tags;
            return newImages;
        });
    };

    const handleUpload = async () => {
        if (images.length === 0) return;

        setUploading(true);
        setError('');
        setSuccess('');
        setUploadProgress(0);

        try {
            const total = images.length;
            let uploaded = 0;

            for (const image of images) {
                const formData = new FormData();
                formData.append('file', image.file);
                formData.append('name', image.name);
                formData.append('tags', image.tags);
                // Set the owner to the current authenticated user
                formData.append('owner', pb.authStore.model?.id || '');

                await pb.collection('images').create(formData);

                uploaded++;
                setUploadProgress((uploaded / total) * 100);
            }

            setSuccess(`Successfully uploaded ${uploaded} image${uploaded > 1 ? 's' : ''}!`);
            // Clear images after successful upload
            images.forEach(img => URL.revokeObjectURL(img.preview));
            setImages([]);
        } catch (err) {
            setError('Failed to upload images. Please try again.');
            console.error(err);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="container mx-auto px-6 pb-8">
            <div className="max-w-4xl mx-auto">
                {/* Status Messages */}
                {error && (
                    <div className="mb-6 rounded-xl backdrop-blur-md bg-red-500/20 dark:bg-red-500/20 p-4 text-sm text-red-900 dark:text-red-200 border border-red-500/30">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-xl backdrop-blur-md bg-green-500/20 dark:bg-green-500/20 p-4 text-sm text-green-900 dark:text-green-200 border border-green-500/30">
                        {success}
                    </div>
                )}

                {/* Upload Area */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                        relative border-4 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                        ${isDragging
                            ? 'border-purple-400 bg-purple-500/20 scale-[1.02]'
                            : 'border-white/30 bg-white/10 hover:bg-white/15'
                        }
                        backdrop-blur-md shadow-xl
                    `}
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upload Images</h2>

                    <div
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragging
                            ? 'border-purple-500 bg-purple-500/10 scale-105'
                            : 'border-white/30 dark:border-white/10 hover:border-purple-500/50 hover:bg-white/5'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <svg className="w-16 h-16 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Drop images here or click to browse
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                    Supports JPEG, PNG, HEIC, and more
                                </p>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                    <div className="backdrop-blur-xl bg-white/10 dark:bg-black/30 rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-white/10 mb-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            Ready to Upload ({images.length})
                        </h3>

                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {images.map((image, index) => (
                                <div key={index} className="backdrop-blur-md bg-white/20 dark:bg-white/5 rounded-xl p-4 border border-white/30 dark:border-white/10">
                                    <div className="flex gap-4">
                                        <img
                                            src={image.preview}
                                            alt={image.name}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                    Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={image.name}
                                                    onChange={(e) => updateImageName(index, e.target.value)}
                                                    className="w-full rounded-lg backdrop-blur-md bg-white/40 dark:bg-black/20 border border-white/30 dark:border-white/10 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                                    Tags (comma-separated)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={image.tags}
                                                    onChange={(e) => updateImageTags(index, e.target.value)}
                                                    placeholder="vacation, beach, sunset"
                                                    className="w-full rounded-lg backdrop-blur-md bg-white/40 dark:bg-black/20 border border-white/30 dark:border-white/10 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="self-start p-2 rounded-lg hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Upload Progress */}
                        {(uploading || converting) && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {converting ? 'Converting images...' : 'Uploading...'}
                                    </span>
                                    {uploading && <span className="text-sm font-semibold text-gray-900 dark:text-white">{Math.round(uploadProgress)}%</span>}
                                </div>
                                <div className="w-full h-2 rounded-full backdrop-blur-md bg-white/40 dark:bg-black/20 overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 ${converting ? 'animate-pulse w-full' : ''}`}
                                        style={{ width: converting ? '100%' : `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Upload Button */}
                        <button
                            onClick={handleUpload}
                            disabled={uploading || converting}
                            className="w-full mt-6 rounded-xl backdrop-blur-md bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600 px-4 py-3 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {converting ? 'Processing...' : (uploading ? 'Uploading...' : 'Upload All Images')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
