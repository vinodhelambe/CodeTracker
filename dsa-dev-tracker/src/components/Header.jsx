import React from "react";
import { useNavigate } from "react-router-dom";
import Hero from "./Hero";

const Feature = ({ title, description }) => (
  <div className="bg-gray-800 p-6 rounded-lg text-center">
    <h3 className="text-xl font-bold text-sky-400 mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const Header = () => {
  const navigator = useNavigate();
  return (
    <div className="w-full bg-gray-900 text-white">
      <div
        className="container mx-auto flex flex-col items-center justify-center text-center px-4"
        style={{ minHeight: '90vh' }}
      >
        <div className="mb-8">
          <Hero />
        </div>
        <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
          Welcome to CodeTrack
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          Track your coding journey. Master DSA. Stay organized.
        </p>
        <button
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300"
          onClick={() => navigator('/login')}
        >
          Get Started
        </button>
      </div>

      <div className="bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Feature
              title="Track Solved Problems"
              description="Log every problem you solve and monitor your progress."
            />
            <Feature
              title="Resource Library"
              description="Access a curated list of articles, videos, and tutorials."
            />
            <Feature
              title="Daily Routine"
              description="Create and follow a personalized daily coding schedule."
            />
            <Feature
              title="Progress Stats"
              description="Visualize your growth with insightful statistics."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
