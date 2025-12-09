import { useState, useEffect } from 'react';
import { pb } from '../lib/pocketbase';
import { Link, useSearchParams } from 'react-router-dom';

interface ImageRecord {
    id: string;
    collectionId: string;
    collectionName: string;
    name: string;
    file: string;
    tags: string;
    created: string;
}

export function Display() {
    const [searchParams] = useSearchParams();
    const [images, setImages] = useState<ImageRecord[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showControls, setShowControls] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [intervalTime, setIntervalTime] = useState(30000);
    const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
    const [sortOrder, setSortOrder] = useState('newest');
    const [portraitPair, setPortraitPair] = useState(false);
    const [aspects, setAspects] = useState<Record<string, number>>({});

    // Computed slides based on images and settings
    const [slides, setSlides] = useState<Array<{ type: 'single' | 'pair', items: ImageRecord[] }>>([]);

    useEffect(() => {
        checkAuthAndFetch();
    }, []);

    // Real-time subscriptions
    useEffect(() => {
        if (!isAuthenticated || !pb.authStore.model) return;

        // Subscribe to image changes (create, delete)
        pb.collection('images').subscribe<ImageRecord>('*', (e) => {
            if (e.action === 'create') {
                setImages((prev) => {
                    const newImages = [e.record, ...prev];
                    // If we are in 'newest' mode, the new image is already at the top.
                    // For other modes, we might want to re-sort, but for now let's just prepend
                    // so the user sees it immediately as requested.
                    return newImages;
                });
                setCurrentIndex(0); // Immediately show the new image
            } else if (e.action === 'delete') {
                setImages((prev) => prev.filter((img) => img.id !== e.record.id));
            }
        });

        // Subscribe to user setting changes
        pb.collection('users').subscribe(pb.authStore.model.id, (e) => {
            if (e.action === 'update') {
                const user = e.record;
                if (user.slideshow_interval) setIntervalTime(user.slideshow_interval * 1000);
                if (user.slideshow_fit) setFitMode(user.slideshow_fit);
                if (user.slideshow_order) setSortOrder(user.slideshow_order);
                if (user.slideshow_portrait_pair) setPortraitPair(user.slideshow_portrait_pair);
            }
        });

        return () => {
            pb.collection('images').unsubscribe('*');
            if (pb.authStore.model) {
                pb.collection('users').unsubscribe(pb.authStore.model.id);
            }
        };
    }, [isAuthenticated]);

    // Sorting Logic
    useEffect(() => {
        if (images.length === 0) return;

        let sortedImages = [...images];

        switch (sortOrder) {
            case 'oldest':
                sortedImages.sort((a, b) => a.created.localeCompare(b.created));
                break;
            case 'random':
                // Pure random shuffle
                sortedImages = shuffle(sortedImages);
                break;
            case 'random_daily':
                // Seed with current date (YYYY-MM-DD)
                const today = new Date().toISOString().split('T')[0];
                sortedImages = seededShuffle(sortedImages, today);
                break;
            case 'random_hourly':
                // Seed with current date + hour (YYYY-MM-DD-HH)
                const now = new Date();
                const hour = now.toISOString().split('T')[0] + '-' + now.getHours();
                sortedImages = seededShuffle(sortedImages, hour);
                break;
            case 'newest':
            default:
                sortedImages.sort((a, b) => b.created.localeCompare(a.created));
                break;
        }

        // Only update if the order actually changed to avoid unnecessary re-renders/resets
        // Simple check: compare first image IDs (not perfect but good enough for now)
        if (sortedImages.length > 0 && images.length > 0 && sortedImages[0].id !== images[0].id) {
            setImages(sortedImages);
            setCurrentIndex(0);
        } else if (sortOrder !== 'newest') {
            // Force update for random modes if we switched TO them
            // (Logic can be improved but this ensures shuffle happens)
            setImages(sortedImages);
        }

    }, [sortOrder]); // We don't include 'images' here to avoid infinite loops with random shuffle

    useEffect(() => {
        if (slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        }, intervalTime);

        return () => clearInterval(interval);
    }, [slides.length, intervalTime]);

    // Aspect Ratio Detection
    useEffect(() => {
        images.forEach(img => {
            if (aspects[img.id]) return; // Already known

            const i = new Image();
            i.src = getImageUrl(img);
            i.onload = () => {
                setAspects(prev => ({ ...prev, [img.id]: i.width / i.height }));
            };
        });
    }, [images]);

    // Slide Generation Logic
    useEffect(() => {
        if (!portraitPair) {
            setSlides(images.map(img => ({ type: 'single', items: [img] })));
            return;
        }

        const newSlides: Array<{ type: 'single' | 'pair', items: ImageRecord[] }> = [];
        let i = 0;
        while (i < images.length) {
            const current = images[i];
            const aspect = aspects[current.id];

            // Check if current is portrait (aspect < 1) or unknown (assume landscape safe for now, or wait? Let's treat unknown as single)
            const isPortrait = aspect && aspect < 1;

            if (isPortrait && i + 1 < images.length) {
                const next = images[i + 1];
                const nextAspect = aspects[next.id];
                const isNextPortrait = nextAspect && nextAspect < 1;

                if (isNextPortrait) {
                    newSlides.push({ type: 'pair', items: [current, next] });
                    i += 2;
                    continue;
                }
            }

            newSlides.push({ type: 'single', items: [current] });
            i++;
        }
        setSlides(newSlides);
    }, [images, portraitPair, aspects]);

    // Fisher-Yates Shuffle
    function shuffle(array: ImageRecord[]) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    // Seeded Shuffle (Linear Congruential Generator)
    function seededShuffle(array: ImageRecord[], seedStr: string) {
        // Create a numeric seed from the string
        let seed = 0;
        for (let i = 0; i < seedStr.length; i++) {
            seed = ((seed << 5) - seed) + seedStr.charCodeAt(i);
            seed |= 0; // Convert to 32bit integer
        }

        const m = 0x80000000;
        const a = 1103515245;
        const c = 12345;

        let state = seed ? seed : Math.floor(Math.random() * (m - 1));

        const nextInt = () => {
            state = (a * state + c) % m;
            return state / (m - 1);
        };

        let currentIndex = array.length, randomIndex;
        let newArray = [...array]; // Copy to avoid mutating original if needed elsewhere

        while (currentIndex != 0) {
            randomIndex = Math.floor(nextInt() * currentIndex);
            currentIndex--;
            [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
        }
        return newArray;
    }

    async function checkAuthAndFetch() {
        const key = searchParams.get('key');
        const email = searchParams.get('email');

        // 1. If already authenticated, just fetch
        if (pb.authStore.isValid) {
            setIsAuthenticated(true);
            loadUserSettings();
            fetchImages();
            return;
        }

        // 2. If key and email are provided, try to login
        if (key && email) {
            try {
                // Clear any existing auth state to ensure a clean login attempt
                pb.authStore.clear();

                await pb.collection('users').authWithPassword(email, key);
                setIsAuthenticated(true);
                loadUserSettings();
                fetchImages();
            } catch (err: any) {
                console.error('Auth failed:', err);
                setError('Invalid credentials. Access denied.');
                setLoading(false);
            }
            return;
        }

        // 3. No key and not authenticated -> Access Denied
        setError('Access Denied. Please provide email and key.');
        setLoading(false);
    }

    function loadUserSettings() {
        const user = pb.authStore.model;
        if (user) {
            if (user.slideshow_interval) {
                setIntervalTime(user.slideshow_interval * 1000); // Convert seconds to ms
            }
            if (user.slideshow_fit) {
                setFitMode(user.slideshow_fit);
            }
            if (user.slideshow_order) {
                setSortOrder(user.slideshow_order);
            }
            if (user.slideshow_portrait_pair) {
                setPortraitPair(user.slideshow_portrait_pair);
            }
        }
    }

    async function fetchImages() {
        try {
            // Fetch only images owned by the current user
            const resultList = await pb.collection('images').getList<ImageRecord>(1, 500, {
                sort: '-created', // Default fetch sort
                filter: `owner = "${pb.authStore.model?.id}"`,
            });
            setImages(resultList.items);
        } catch (err: any) {
            // Ignore auto-cancellation errors
            if (err.isAbort) return;

            console.error(err);
            setError('Failed to load images');
        } finally {
            setLoading(false);
        }
    }

    const getImageUrl = (record: ImageRecord) => {
        return pb.files.getUrl(record, record.file);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-6 p-4 text-center">
                <div className="p-4 rounded-full bg-red-500/20 text-red-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-red-400">Access Denied</h2>
                <p className="text-gray-400 max-w-md">{error}</p>
                <Link to="/login" className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all font-semibold">
                    Login as Admin
                </Link>
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
                <p className="text-2xl">No images found</p>
                <Link to="/admin/upload" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    Upload Photos
                </Link>
            </div>
        );
    }

    return (
        <div
            className="relative min-h-screen bg-black overflow-hidden cursor-none hover:cursor-default"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            {/* Slides with Fade Transition */}
            {slides.map((slide, index) => (
                <div
                    key={index} // Use index as key because slides regroup dynamically
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center bg-black ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    {slide.type === 'pair' ? (
                        <div className="w-full h-full flex flex-row">
                            {slide.items.map((img) => (
                                <div key={img.id} className="w-1/2 h-full relative">
                                    <img
                                        src={getImageUrl(img)}
                                        alt={img.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <img
                            src={getImageUrl(slide.items[0])}
                            alt={slide.items[0].name}
                            className={`w-full h-full ${fitMode === 'contain' ? 'object-contain' : 'object-cover'}`}
                        />
                    )}
                </div>
            ))}

            {/* Hidden Admin Controls */}
            <div className={`absolute top-4 right-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <Link
                    to="/admin/gallery"
                    className="px-4 py-2 bg-black/50 backdrop-blur-md text-white rounded-lg hover:bg-black/70 transition-colors border border-white/20"
                >
                    Manage Photos
                </Link>
            </div>
        </div>
    );
}
