'use client';

import { useState } from 'react';
import TweetAnalyzer from '@/components/TweetAnalyzer';
import ThreadGenerator from '@/components/ThreadGenerator';
import TwitterPoster from '@/components/TwitterPoster';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'generate' | 'post'>('analyze');
  const [generatedThread, setGeneratedThread] = useState<string[]>([]);

  // Function to receive generated thread from ThreadGenerator
  const handleThreadGenerated = (thread: string[]) => {
    setGeneratedThread(thread);
    // No longer automatically switching to post tab
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI-Powered Twitter Thread Replicator
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('analyze')}
                className={`${
                  activeTab === 'analyze'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Analyze Tweets
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                className={`${
                  activeTab === 'generate'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Generate Thread
              </button>
              <button
                onClick={() => setActiveTab('post')}
                className={`${
                  activeTab === 'post'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Post to Twitter
              </button>
            </nav>
          </div>

          {/* Tab content */}
          <div className="mt-8">
            {activeTab === 'analyze' && <TweetAnalyzer />}
            {activeTab === 'generate' && <ThreadGenerator onThreadGenerated={handleThreadGenerated} />}
            {activeTab === 'post' && <TwitterPoster tweets={generatedThread} />}
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 shadow mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            AI-Powered Twitter Thread Replicator and Publisher
          </p>
        </div>
      </footer>
    </div>
  );
}
