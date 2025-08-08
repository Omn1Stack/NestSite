"use client";
import Image from "next/image";
import { useImages } from '@/api/images/images';
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const HeroImageStack = () => {
 const currentUserId = 1;
   const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useImages(currentUserId);
   const queryClient = useQueryClient();
 

  const photos = useMemo(
    () => data?.pages.flatMap((page) => page.photos) ?? [],
    [data]
  );

  const [topImageIndex, setTopImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const currentImages = useMemo(
    () => photos.slice(topImageIndex, topImageIndex + 5),
    [photos, topImageIndex]
  );

  useEffect(() => {
    if (
      photos.length > 0 &&
      topImageIndex >= photos.length - 3 &&
      hasNextPage &&
      !isAnimating
    ) {
      fetchNextPage();
    }
  }, [photos.length, topImageIndex, hasNextPage, fetchNextPage, isAnimating]);

  const handleNext = () => {
    if (isAnimating || topImageIndex >= photos.length - 1) return;
    setDirection("next");
    setIsAnimating(true);
    setTopImageIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (isAnimating || topImageIndex === 0) return;
    setDirection("prev");
    setIsAnimating(true);
    setTopImageIndex((prev) => prev - 1);
  };

  const onExitComplete = () => {
    setIsAnimating(false);
  };

  const handleImageError = (imageId) => {
    setImageLoadErrors((prev) => new Set(new Set(prev)).add(imageId));
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-96 h-[500px] rounded-xl bg-white/10 backdrop-blur-sm animate-pulse" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-white/30 animate-pulse"
              />
            ))}
          </div>
          <p className="text-white/60 text-sm">Loading your photos...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="w-96 h-[500px] rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/20 flex items-center justify-center">
            <div className="text-red-400">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.876c1.473 0 2.667-1.194 2.667-2.667V6.667C21.605 5.194 20.411 4 18.938 4H5.062C3.589 4 2.395 5.194 2.395 6.667v10.666C2.395 18.806 3.589 20 5.062 20z"
                />
              </svg>
              <p className="text-lg font-medium">Failed to load photos</p>
            </div>
          </div>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["usersImages"] })
            }
            className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center ">
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="w-96 h-[500px] rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
            <div className="text-white/60">
              <svg
                className="w-16 h-16 mx-auto mb-4"
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
              <p className="text-lg font-medium">No photos yet</p>
              <p className="text-sm text-white/40 mt-2">
                Upload your first photo to get started
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden px-8">
      <div className="absolute inset-0 pointer-events-none" />
      <div className="relative z-10 flex items-center justify-between max-w-7xl w-full px-16">
        <button
          onClick={handlePrevious}
          disabled={isAnimating || topImageIndex === 0}
          className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group flex-shrink-0"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="relative w-96 h-[500px]">
          <AnimatePresence custom={direction} onExitComplete={onExitComplete}>
            {currentImages.map((image, index) => {
              const isTop = index === 0;
              const hasError = imageLoadErrors.has(image.id);

              const variants = {
                initial: (customDirection) => ({
                  x: customDirection === "next" ? 600 : -600,
                  y: -150,
                  scale: 0.5,
                  opacity: 0,
                }),
                animate: {
                  x: index * 15,
                  y: index * -2,
                  scale: 1 - index * 0.03,
                  rotate: (5 - 1 - index) * -8,
                  opacity: 1,
                  zIndex: photos.length - topImageIndex - index,
                  transition: {
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                  },
                },
                exit: (customDirection) => ({
                  x: customDirection === "next" ? 600 : -600,
                  y: -150,
                  rotate: 45 * (customDirection === "next" ? 1 : -1),
                  scale: 0.3,
                  opacity: 0,
                  transition: {
                    duration: 0.5,
                    ease: [0.4, 0, 0.2, 1],
                  },
                }),
              };

              return (
                <motion.div
                  key={image.id}
                  className="absolute w-full h-full rounded-xl shadow-2xl overflow-hidden cursor-pointer"
                  custom={direction}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover={
                    isTop
                      ? {
                          scale: 1.05,
                          y: -16,
                          transition: { duration: 0.2 },
                        }
                      : {}
                  }
                  onClick={isTop ? handleNext : undefined}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100" />
                  {hasError ? (
                    <div className="relative w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                      <div className="text-white/80 text-center">
                        <svg
                          className="w-12 h-12 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01M5 12a7 7 0 1114 0v5a7 7 0 11-14 0v-5z"
                          />
                        </svg>
                        <p className="text-sm">Failed to load</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <Image
                        src={image.image_url || `/api/placeholder/384/500`}
                        alt={image.alt || `Photo ${image.id}`}
                        fill
                        sizes="384px"
                        className="w-full h-full object-cover"
                        priority={index < 2}
                        quality={95}
                        onError={() => handleImageError(image.id)}
                        onLoad={() => {
                          setImageLoadErrors((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(image.id);
                            return newSet;
                          });
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-xl border border-white/20" />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <button
          onClick={handleNext}
          disabled={isAnimating || topImageIndex >= photos.length - 1}
          className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group flex-shrink-0"
        >
          <svg
            className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      
    </div>
  );
};

export default HeroImageStack;