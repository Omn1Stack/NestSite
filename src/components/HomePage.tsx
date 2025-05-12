"use client"
import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import {
  FiUpload,
  FiUsers,
  FiImage,
  FiAward,
  FiShare2,
  FiLock,
} from "react-icons/fi";
import { heroImages } from "@/Utils/heroImages";
import Image from "next/image";

const HomePage = () => {
  return (
    <>
      <Head>
        <title>Nest | Premium Photo Storage & Sharing</title>
        <meta
          name="description"
          content="Store, organize, and share your photos with Nest. AI-powered features for the modern photographer."
        />
      </Head>

      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
        <div className="container mx-auto px-6 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Photos.{" "}
              <span className="text-purple-400">Perfectly Nested.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
              High-quality storage, intelligent organization, and seamless
              sharing for your precious memories.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-full text-lg transition-all"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-purple-400 text-purple-400 hover:bg-purple-900/30 font-semibold py-3 px-8 rounded-full text-lg transition-all"
              >
                See Demo
              </motion.button>
            </div>
          </motion.div>

          {/* Floating Photo Grid Animation */}
          <motion.div
            className="mt-20 grid grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            {heroImages.map((image) => (
              <motion.div
                key={image.id}
                className="relative bg-white/10 backdrop-blur-sm rounded-lg aspect-square overflow-hidden"
                whileHover={{ y: -10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill 
                  sizes="(max-width: 768px) 33vw, 25vw" 
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                  quality={85}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for{" "}
              <span className="text-purple-400">Your Memories</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Nest goes beyond basic storage with intelligent tools to organize,
              enhance, and share your photos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 transition-all"
              >
                <div className="text-purple-400 text-4xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Showcase Section */}
      <div className="py-20 bg-gradient-to-br from-gray-900 to-purple-900/30">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                AI-Powered <span className="text-purple-400">Photo Magic</span>
              </h2>
              <p className="text-gray-300 mb-8">
                Our advanced AI helps you rediscover your memories in new ways.
              </p>
              <ul className="space-y-4">
                {aiFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="text-purple-400 mt-1">
                      <FiAward />
                    </div>
                    <div>
                      <h4 className="font-semibold">{feature.title}</h4>
                      <p className="text-gray-400 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="lg:w-1/2 relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-purple-500/20 rounded-2xl rotate-6 blur-sm"></div>
                <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50">
                  <div className="aspect-video bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">✨</div>
                      <h3 className="text-xl font-bold mb-2">
                        AI Photo Showcase
                      </h3>
                      <p className="text-gray-400">
                        See what our AI can do with your photos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gray-900">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Nest{" "}
              <span className="text-purple-400">Your Photos?</span>
            </h2>
            <p className="text-gray-400 mb-10">
              Join thousands of photographers and memory-keepers who trust Nest
              with their precious moments.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-12 rounded-full text-lg transition-all"
            >
              Start Your Free Trial
            </motion.button>
            <p className="text-gray-500 mt-4 text-sm">
              No credit card required
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

const features = [
  {
    icon: <FiUpload />,
    title: "High-Quality Storage",
    description:
      "Store your photos in original quality with zero compression. We preserve every detail.",
  },
  {
    icon: <FiUsers />,
    title: "Shared Groups",
    description:
      "Create or join groups to collaborate on photo collections with friends and family.",
  },
  {
    icon: <FiImage />,
    title: "Smart Albums",
    description:
      "Automatically organized albums based on dates, locations, and recognized faces.",
  },
  {
    icon: <FiShare2 />,
    title: "Link Sharing",
    description:
      "Share photos via beautiful links with customizable access and expiration options.",
  },
  {
    icon: <FiAward />,
    title: "AI Collages",
    description:
      "Let our AI create stunning collages and memories from your photo collection.",
  },
  {
    icon: <FiLock />,
    title: "End-to-End Encryption",
    description:
      "Optional encryption for your most private photos and memories.",
  },
];

const aiFeatures = [
  {
    title: "Face Recognition",
    description:
      "Automatically group photos by people so you can find all photos of someone instantly.",
  },
  {
    title: "Memory Collages",
    description:
      "AI creates beautiful collages from related photos, perfect for sharing highlights.",
  },
  {
    title: "Smart Search",
    description:
      "Find photos by describing them - 'beach sunset with dog' works like magic.",
  },
  {
    title: "Auto Enhance",
    description:
      "One-click enhancements that make your photos pop without looking overprocessed.",
  },
];

export default HomePage;
