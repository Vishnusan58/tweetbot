import { useState, useEffect } from 'react';

interface TwitterCredentials {
  username: string;
  password: string;
}

interface PostOptions {
  scheduledTime?: string;
  headless: boolean;
}

interface PostResult {
  success: boolean;
  tweetId?: string;
  error?: string;
  url?: string;
}

export default function TwitterPoster({ tweets }: { tweets: string[] }) {
  // Log tweets received for posting
  useEffect(() => {
    if (tweets && tweets.length > 0) {
      console.log('Tweets ready for posting:');
      tweets.forEach((tweet, index) => {
        console.log(`Tweet ${index + 1}: ${tweet}`);
      });
    }
  }, [tweets]);

  const [credentials, setCredentials] = useState<TwitterCredentials>({
    username: '',
    password: '',
  });
  const [options, setOptions] = useState<PostOptions>({
    scheduledTime: '',
    headless: true,
  });
  const [results, setResults] = useState<PostResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);

  const handleCredentialChange = (key: keyof TwitterCredentials, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleOptionChange = (key: keyof PostOptions, value: any) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const postThread = async () => {
    if (!tweets || tweets.length === 0) {
      setError('No tweets to post');
      return;
    }

    if (!credentials.username || !credentials.password) {
      setError('Twitter credentials are required');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'post',
          tweets,
          credentials,
          headless: options.headless,
          scheduledTime: options.scheduledTime ? new Date(options.scheduledTime).toISOString() : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post thread');
      }

      setResults(data.results);

      // Log posting results to the terminal
      console.log('Tweet Posting Results:');
      data.results.forEach((result, index) => {
        console.log(`Tweet ${index + 1}: ${result.success ? 'Posted successfully' : 'Failed'} ${result.url ? `- ${result.url}` : ''} ${result.error ? `- Error: ${result.error}` : ''}`);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!tweets || tweets.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
        <p>Generate a thread first to post it to Twitter</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-2xl">
      <h2 className="text-2xl font-bold">Post to Twitter</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Post your generated thread to Twitter using Selenium automation.
      </p>

      <div className="space-y-4">
        <div className="border-b pb-4">
          <button
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            onClick={() => setShowCredentials(!showCredentials)}
          >
            {showCredentials ? '- Hide' : '+ Show'} Twitter Credentials
          </button>

          {showCredentials && (
            <div className="mt-3 space-y-3 p-3 border rounded-md bg-gray-50 dark:bg-gray-900">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Twitter Username
                </label>
                <input
                  id="username"
                  type="text"
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  value={credentials.username}
                  onChange={(e) => handleCredentialChange('username', e.target.value)}
                  placeholder="Your Twitter username or email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Twitter Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  value={credentials.password}
                  onChange={(e) => handleCredentialChange('password', e.target.value)}
                  placeholder="Your Twitter password"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: Credentials are only used for automation and are not stored.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="scheduledTime" className="block text-sm font-medium mb-1">
              Schedule Time (Optional)
            </label>
            <input
              id="scheduledTime"
              type="datetime-local"
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              value={options.scheduledTime}
              onChange={(e) => handleOptionChange('scheduledTime', e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <input
              id="headless"
              type="checkbox"
              className="h-4 w-4 text-blue-600 rounded"
              checked={options.headless}
              onChange={(e) => handleOptionChange('headless', e.target.checked)}
            />
            <label htmlFor="headless" className="ml-2 block text-sm">
              Run in Headless Mode
            </label>
          </div>
        </div>

        <div className="pt-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            onClick={postThread}
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post Thread to Twitter'}
          </button>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>

      {results.length > 0 && (
        <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-xl font-semibold mb-4">Posting Results</h3>

          <div className="space-y-3">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 border rounded-md ${
                  result.success 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900'
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Tweet {index + 1}</span>
                  <span className={result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {result.success ? 'Posted' : 'Failed'}
                  </span>
                </div>

                {result.success && result.url && (
                  <a 
                    href={result.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View on Twitter
                  </a>
                )}

                {!result.success && result.error && (
                  <p className="text-red-600 dark:text-red-400 text-sm">{result.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
