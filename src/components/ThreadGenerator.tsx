import { useState, useCallback } from 'react';

interface ThreadGenerationOptions {
  followUpCount: number;
  includeCTA: boolean;
  style?: {
    emojiCount?: number;
    usesBulletPoints?: boolean;
    avgSentenceLength?: number;
    contentType?: string;
  };
}

interface ThreadGeneratorProps {
  onThreadGenerated?: (thread: string[]) => void;
}

export default function ThreadGenerator({ onThreadGenerated }: ThreadGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [options, setOptions] = useState<ThreadGenerationOptions>({
    followUpCount: 3,
    includeCTA: true,
    style: undefined,
  });
  const [thread, setThread] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useStyle, setUseStyle] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const generateThread = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic for the thread');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate',
          topic,
          followUpCount: options.followUpCount,
          includeCTA: options.includeCTA,
          style: useStyle ? options.style : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate thread');
      }

      setThread(data.thread);

      // Log the generated tweets to the terminal
      console.log('Generated Thread:');
      data.thread.forEach((tweet, index) => {
        console.log(`Tweet ${index + 1}: ${tweet}`);
      });

      // Call the onThreadGenerated callback if provided
      if (onThreadGenerated) {
        onThreadGenerated(data.thread);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (key: keyof ThreadGenerationOptions, value: any) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleStyleChange = (key: string, value: any) => {
    setOptions((prev) => ({
      ...prev,
      style: {
        ...prev.style,
        [key]: value,
      },
    }));
  };

  const copyThreadToClipboard = useCallback(() => {
    if (thread.length === 0) return;

    // Join all tweets with double line breaks to make them easily readable
    const threadText = thread.join('\n\n');

    // Use the Clipboard API to copy the text
    navigator.clipboard.writeText(threadText)
      .then(() => {
        setCopySuccess(true);
        // Reset the success message after 2 seconds
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy thread: ', err);
        setError('Failed to copy thread to clipboard');
      });
  }, [thread]);

  return (
    <div className="space-y-6 w-full max-w-2xl">
      <h2 className="text-2xl font-bold">Thread Generator</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Generate a Twitter thread on any topic with customizable style.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-1">
            Topic
          </label>
          <input
            id="topic"
            type="text"
            className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            placeholder="e.g., 'AI tools for productivity'"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="followUpCount" className="block text-sm font-medium mb-1">
              Number of Follow-up Tweets
            </label>
            <input
              id="followUpCount"
              type="number"
              min="1"
              max="10"
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              value={options.followUpCount}
              onChange={(e) => handleOptionChange('followUpCount', parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="flex items-center">
            <input
              id="includeCTA"
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded"
              checked={options.includeCTA}
              onChange={(e) => handleOptionChange('includeCTA', e.target.checked)}
            />
            <label htmlFor="includeCTA" className="ml-2 block text-sm">
              Include Call-to-Action Tweet
            </label>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center mb-4">
            <input
              id="useStyle"
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded"
              checked={useStyle}
              onChange={(e) => setUseStyle(e.target.checked)}
            />
            <label htmlFor="useStyle" className="ml-2 block text-sm font-medium">
              Use Custom Style
            </label>
          </div>

          {useStyle && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
              <div>
                <label htmlFor="emojiCount" className="block text-sm font-medium mb-1">
                  Emoji Count
                </label>
                <input
                  id="emojiCount"
                  type="number"
                  min="0"
                  max="10"
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  value={options.style?.emojiCount || 0}
                  onChange={(e) => handleStyleChange('emojiCount', parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label htmlFor="contentType" className="block text-sm font-medium mb-1">
                  Content Type
                </label>
                <select
                  id="contentType"
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  value={options.style?.contentType || ''}
                  onChange={(e) => handleStyleChange('contentType', e.target.value)}
                >
                  <option value="">Auto-detect</option>
                  <option value="promotional">Promotional</option>
                  <option value="educational">Educational</option>
                  <option value="storytelling">Storytelling</option>
                  <option value="question">Question-based</option>
                  <option value="statistic">Statistics/Data</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  id="usesBulletPoints"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 rounded"
                  checked={options.style?.usesBulletPoints || false}
                  onChange={(e) => handleStyleChange('usesBulletPoints', e.target.checked)}
                />
                <label htmlFor="usesBulletPoints" className="ml-2 block text-sm">
                  Use Bullet Points
                </label>
              </div>
            </div>
          )}
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          onClick={generateThread}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Thread'}
        </button>

        {error && <p className="text-red-500">{error}</p>}
      </div>

      {thread.length > 0 && (
        <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-xl font-semibold mb-4">Generated Thread</h3>

          <div className="space-y-4">
            {thread.map((tweet, index) => (
              <div key={index} className="p-3 border rounded-md bg-white dark:bg-gray-800">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    {index === 0 
                      ? 'Hook Tweet' 
                      : index === thread.length - 1 && options.includeCTA 
                        ? 'CTA Tweet' 
                        : `Tweet ${index + 1}`}
                  </span>
                  <span className="text-gray-500 text-sm">{tweet.length} chars</span>
                </div>
                <p className="whitespace-pre-line">{tweet}</p>
              </div>
            ))}

            <div className="mt-6 flex justify-center">
              <button
                onClick={copyThreadToClipboard}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <span>{copySuccess ? 'Copied!' : 'Copy Entire Thread'}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
