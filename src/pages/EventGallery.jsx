import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, X, ChevronLeft, ChevronRight, Image as ImageIcon, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EventGallery = () => {
  const { year } = useParams();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'images', 'videos'

  useEffect(() => {
    // Load media from the year folder
    const loadMedia = async () => {
      setLoading(true);
      try {
        // Dynamic import of media files from the year folder
        // This assumes media files are in public/gallery/{year}/ folder
        const mediaFiles = [];
        
        // You'll need to provide a manifest or use a different approach
        // For now, we'll check for common patterns
        // In production, you might want to create a JSON manifest for each year
        
        try {
          const manifest = await import(`../gallery/${year}/manifest.json`);
          if (manifest.default) {
            setMedia(manifest.default);
          }
        } catch (e) {
          console.log('No manifest found for year', year);
          setMedia([]);
        }
      } catch (error) {
        console.error('Error loading media:', error);
        setMedia([]);
      }
      setLoading(false);
    };

    loadMedia();
  }, [year]);

  const filteredMedia = media.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'images') return item.type === 'image';
    if (filter === 'videos') return item.type === 'video';
    return true;
  });

  const openLightbox = (index) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredMedia.length - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev < filteredMedia.length - 1 ? prev + 1 : 0));
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredMedia.length]);

  const imageCount = media.filter(m => m.type === 'image').length;
  const videoCount = media.filter(m => m.type === 'video').length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to={`/leaderboard/${year}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Leaderboard</span>
              </Link>
            </div>
            <h1 className="text-2xl font-bold">
              <span className="text-primary">{year}</span> Event Gallery
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="w-4 h-4" />
              <span>{imageCount}</span>
              <Video className="w-4 h-4 ml-2" />
              <span>{videoCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2">
          {['all', 'images', 'videos'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <main className="container mx-auto px-4 pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">No media found for {year}</p>
            <p className="text-sm mt-2">
              Add a manifest.json file in src/gallery/{year}/ to display media
            </p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
          >
            {filteredMedia.map((item, index) => (
              <motion.div
                key={item.src}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1 }
                }}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                {item.type === 'video' ? (
                  <>
                    <video
                      src={item.src}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </>
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt || `Gallery image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation buttons */}
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors z-10"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            {/* Media display */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {filteredMedia[selectedIndex]?.type === 'video' ? (
                <video
                  src={filteredMedia[selectedIndex].src}
                  className="max-w-full max-h-[90vh] rounded-lg"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={filteredMedia[selectedIndex]?.src}
                  alt={filteredMedia[selectedIndex]?.alt || 'Gallery image'}
                  className="max-w-full max-h-[90vh] rounded-lg object-contain"
                />
              )}
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {selectedIndex + 1} / {filteredMedia.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventGallery;
