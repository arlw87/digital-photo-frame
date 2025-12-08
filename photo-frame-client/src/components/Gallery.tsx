import { useState, useEffect } from 'react';
import { pb } from '../lib/pocketbase';
import { useTheme } from '../context/ThemeContext';

interface ImageRecord {
    id: string;
    collectionId: string;
    collectionName: string;
    name: string;
    file: string;
    tags: string;
    created: string;
}

export function Gallery() {
    const [images, setImages] = useState<ImageRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterTag, setFilterTag] = useState('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        fetchImages();
    }, [sortOrder, filterTag]);

    async function fetchImages() {
        setLoading(true);
        try {
            // Build filter: combine owner filter with optional tag filter
            let filter = `owner = "${pb.authStore.model?.id}"`;
            if (filterTag) {
                filter += ` && tags ~ "${filterTag}"`;
            }

            const resultList = await pb.collection('images').getList<ImageRecord>(1, 50, {
                sort: sortOrder === 'desc' ? '-created' : 'created',
                filter: filter,
            });
            setImages(resultList.items);
            setError(''); // Clear error on success
        } catch (err: any) {
            // Ignore auto-cancellation errors
            if (err.isAbort) return;
            console.error(err);
            setError('Failed to load images');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        try {
            await pb.collection('images').delete(id);
            setImages(images.filter(img => img.id !== id));
            setDeleteConfirm(null);
            if (selectedImage?.id === id) setSelectedImage(null);
        } catch (err) {
            console.error(err);
            setError('Failed to delete image');
        }
    }

    const getImageUrl = (record: ImageRecord) => {
        return pb.files.getUrl(record, record.file);
    };

    return (
        <div className="container mx-auto px-6 pb-8">
            <div className="max-w-6xl mx-auto">
                {/* Controls Bar */}
                <div className="mb-8 p-4 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-lg flex flex-col md:flex-row gap-4 justify-between items-center">
                    {/* Search/Filter */}
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Filter by tag..."
                            value={filterTag}
                            onChange={(e) => setFilterTag(e.target.value)}
                            className="w-full rounded-xl backdrop-blur-md bg-white/40 dark:bg-black/20 border border-white/30 dark:border-white/10 px-4 py-2 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                            className="rounded-xl backdrop-blur-md bg-white/40 dark:bg-black/20 border border-white/30 dark:border-white/10 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 font-medium">
                        {images.length} images found
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="relative z-10 container mx-auto px-4 pb-8">
                {error && (
                    <div className="mb-6 rounded-xl backdrop-blur-md bg-red-500/20 dark:bg-red-500/20 p-4 text-sm text-red-900 dark:text-red-200 border border-red-500/30">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map((img) => (
                            <div
                                key={img.id}
                                className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg border border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/30 backdrop-blur-sm transition-all hover:scale-[1.02] cursor-pointer"
                                onClick={() => setSelectedImage(img)}
                            >
                                <img
                                    src={getImageUrl(img)}
                                    alt={img.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <p className="text-white font-medium truncate">{img.name}</p>
                                    {img.tags && (
                                        <p className="text-white/80 text-xs truncate">🏷️ {img.tags}</p>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirm(img.id);
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Delete Confirmation Overlay */}
                                {deleteConfirm === img.id && (
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20">
                                        <p className="text-white font-bold mb-4">Delete this image?</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDelete(img.id)}
                                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(null)}
                                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Full Screen Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <img
                        src={getImageUrl(selectedImage)}
                        alt={selectedImage.name}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white pointer-events-none">
                        <h3 className="text-xl font-bold">{selectedImage.name}</h3>
                        {selectedImage.tags && <p className="text-white/70">{selectedImage.tags}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
