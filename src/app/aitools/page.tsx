"use client";

import { PricingSection } from "@/components/PricingSection";
import aifeatures from "@/types/Aifeaturestype";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  FiPenTool,
  FiRepeat,
  FiSearch,
  FiSmile,
  FiStar,
  FiZap,
} from "react-icons/fi";

const AIToolsPage = () => {
  const features :aifeatures[] = [
    {
      icon: <FiStar />,
      title: "Smart Enhancement",
      description:
        "Automatically improve lighting, colors, and sharpness with one click",
    },
    {
      icon: <FiSmile />,
      title: "Face Recognition",
      description: "Automatically group photos by people and create albums",
    },
    {
      icon: <FiPenTool />,
      title: "Style Transfer",
      description: "Apply artistic styles to your photos like famous painters",
    },
    {
      icon: <FiSearch />,
      title: "Object Detection",
      description:
        "Find photos by objects in them - 'beach', 'dog', 'food' etc",
    },
    {
      icon: <FiRepeat />,
      title: "Background Replacement",
      description: "Automatically remove or replace photo backgrounds",
    },
    {
      icon: <FiZap />,
      title: "Magic Restoration",
      description: "Restore old or damaged photos using AI reconstruction",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900 to-gray-900 py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            AI-Powered <span className="text-purple-400">Photo Magic</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
            Transform your photos with our cutting-edge artificial intelligence
            tools
          </p>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 hover:bg-gray-800/70 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 transition-all"
            >
              <div className="text-purple-400 text-4xl mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
              <button className="mt-6 text-purple-400 hover:text-purple-300 flex items-center">
                Try Now <FiZap className="ml-2" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Demo Section */}
      <div className="bg-gray-800/50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            See It in Action
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative aspect-square rounded-2xl overflow-hidden border border-gray-700"
            >
              <Image
                src="https://www.befunky.com/images/prismic/391d50e3-1268-45e1-aaaa-3cfe6f2fb90d_hero-blur-image-2.jpg?auto=avif,webp&format=jpg&width=896"
                alt="Before AI Enhancement"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
                <span className="text-gray-300">Original Photo</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative aspect-square rounded-2xl overflow-hidden border border-purple-500"
            >
              <Image
                src="https://sdmntpreastus.oaiusercontent.com/files/00000000-30ec-61f9-be42-767505262689/raw?se=2025-05-16T00%3A07%3A47Z&sp=r&sv=2024-08-04&sr=b&scid=00000000-0000-0000-0000-000000000000&skoid=31bc9c1a-c7e0-460a-8671-bf4a3c419305&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-05-15T22%3A05%3A21Z&ske=2025-05-16T22%3A05%3A21Z&sks=b&skv=2024-08-04&sig=Epe5jMFJ2QuGfL427KpL3ibJiqAwkII2DKHP2vaj42U%3D"
                alt="After AI Enhancement"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-purple-500/50 p-4">
                <span className="text-white">Enhanced with AI</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <PricingSection features={features} />
      {/* CTA Section */}
      <div className="bg-gradient-to-br from-purple-900 to-gray-900 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Transform Your Photos?
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of users already creating magic with our AI tools
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full text-lg"
        >
          Start Free Trial
        </motion.button>
      </div>
    </div>
  );
};

export default AIToolsPage;
