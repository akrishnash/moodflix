import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Background cinema poster carousel that continuously scrolls movie/TV show posters
 * Creates an immersive cinema atmosphere
 */
export function CinemaPosterCarousel() {
  // Popular movie/TV show poster URLs (using TMDB image base URL format)
  // These are placeholder URLs - in production, fetch from TMDB API
  const posterUrls = [
    "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg", // Dune
    "https://image.tmdb.org/t/p/w500/kXfqcdQKsToO0OUXHcrrNvhDBzU.jpg", // Shawshank Redemption
    "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", // The Godfather
    "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", // The Matrix
    "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", // Interstellar
    "https://image.tmdb.org/t/p/w500/6KErczPBROQty7QoIsaa6wJYXZi.jpg", // Inception
    "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg", // Spider-Man
    "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61eNJ22NqYzqj.jpg", // Blade Runner
    "https://image.tmdb.org/t/p/w500/5bFK5d3mVTAvBCY5wBW3D9JaJ3A.jpg", // Fight Club
    "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", // The Dark Knight
  ];

  // Duplicate for seamless looping
  const duplicatedPosters = [...posterUrls, ...posterUrls];
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!containerRef.current || !isAnimating) return;

    const container = containerRef.current;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame
    let animationFrameId: number;

    const scroll = () => {
      scrollPosition += scrollSpeed;
      
      // Reset when we've scrolled through one set of posters
      const maxScroll = container.scrollWidth / 2;
      if (scrollPosition >= maxScroll) {
        scrollPosition = 0;
      }

      container.scrollLeft = scrollPosition;
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isAnimating]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Horizontal scrolling poster carousel */}
      <div
        ref={containerRef}
        className="flex gap-4 h-full opacity-15"
        style={{
          width: "200%", // Double width for seamless loop
        }}
      >
        {duplicatedPosters.map((posterUrl, index) => (
          <motion.div
            key={`${posterUrl}-${index}`}
            className="flex-shrink-0 w-[200px] h-[300px] rounded-lg overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={posterUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                (e.target as HTMLImageElement).src = `https://via.placeholder.com/200x300/1a1a24/6366f1?text=Movie+Poster`;
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Gradient overlay from top and bottom for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
    </div>
  );
}




