import { useState } from 'react';

interface AnalysisResult {
  structure: {
    hook: string;
    emojiCount: number;
    emojis: string;
    hasCTA: boolean;
    hasMediaReference: boolean;
  };
  contentType: string;
  style: {
    sentenceCount: number;
    avgSentenceLength: number;
    formatting: {
      usesBulletPoints: boolean;
      usesNumberedList: boolean;
      usesAllCaps: boolean;
      usesBold: boolean;
      usesItalics: boolean;
      usesLineBreaks: boolean;
    };
    tweetLength: number;
  };
}

export default function TweetAnalyzer() {
  const [tweetText, setTweetText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeTweet = async () => {
    if (!tweetText.trim()) {
      setError('Please enter a tweet to analyze');
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
          action: 'analyze',
          tweetText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze tweet');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-2xl">
      <h2 className="text-2xl font-bold">Tweet Analyzer</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Paste a tweet to analyze its structure, content type, and style.
      </p>

      <div className="space-y-4">
        <textarea
          className="w-full h-32 p-3 border rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
          placeholder="Paste a tweet here..."
          value={tweetText}
          onChange={(e) => setTweetText(e.target.value)}
        />

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          onClick={analyzeTweet}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Tweet'}
        </button>

        {error && <p className="text-red-500">{error}</p>}
      </div>

      {analysis && (
        <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-xl font-semibold mb-4">Analysis Results</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-lg">Structure</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Hook: <span className="font-mono">{analysis.structure.hook.substring(0, 50)}...</span></li>
                <li>Emoji Count: {analysis.structure.emojiCount}</li>
                <li>Emojis Used: {analysis.structure.emojis || 'None'}</li>
                <li>Has CTA: {analysis.structure.hasCTA ? 'Yes' : 'No'}</li>
                <li>References Media: {analysis.structure.hasMediaReference ? 'Yes' : 'No'}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-lg">Content Type</h4>
              <p className="capitalize">{analysis.contentType}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-lg">Style</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sentences: {analysis.style.sentenceCount}</li>
                <li>Avg Sentence Length: {Math.round(analysis.style.avgSentenceLength)} characters</li>
                <li>Tweet Length: {analysis.style.tweetLength} characters</li>
                <li>
                  Formatting:
                  <ul className="list-circle pl-5">
                    {analysis.style.formatting.usesBulletPoints && <li>Bullet Points</li>}
                    {analysis.style.formatting.usesNumberedList && <li>Numbered List</li>}
                    {analysis.style.formatting.usesAllCaps && <li>ALL CAPS for emphasis</li>}
                    {analysis.style.formatting.usesBold && <li>Bold Text</li>}
                    {analysis.style.formatting.usesItalics && <li>Italic Text</li>}
                    {analysis.style.formatting.usesLineBreaks && <li>Line Breaks</li>}
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}