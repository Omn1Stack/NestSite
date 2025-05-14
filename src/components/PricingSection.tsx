"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiZap } from "react-icons/fi";
import aifeatures from "@/types/Aifeaturestype";

interface PricingSectionProps {
  features: aifeatures[];
}

export const PricingSection: React.FC<PricingSectionProps> = ({ features }) => {
  return (
    <div className="py-16 container mx-auto px-6">
      <h2 className="text-3xl font-bold text-center mb-12">AI Tools Pricing</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {["Basic", "Pro", "Enterprise"].map((tier, index) => (
          <motion.div
            key={tier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className={`p-8 rounded-xl ${
              tier === "Pro"
                ? "bg-purple-900/50 border-purple-500"
                : "bg-gray-800/50 border-gray-700"
            } border`}
          >
            <h3 className="text-2xl font-bold mb-4">{tier} Tier</h3>
            <div className="text-4xl font-bold mb-6">
              {tier === "Basic"
                ? "Free"
                : tier === "Pro"
                ? "$9.99/mo"
                : "Custom"}
            </div>
            <ul className="space-y-4 mb-8">
              {features
                .slice(0, tier === "Basic" ? 3 : tier === "Pro" ? 5 : 6)
                .map((f) => (
                  <li key={f.title} className="flex items-center">
                    <FiZap className="text-purple-400 mr-2" /> {f.title}
                  </li>
                ))}
            </ul>
            <button
              className={`w-full py-3 rounded-lg ${
                tier === "Pro"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              Get Started
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
