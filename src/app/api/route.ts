// API routes for handling tweet analysis, generation, and posting
import { NextRequest, NextResponse } from 'next/server';
import { analyzeTweet } from '@/utils/tweetAnalysis';
import { generateThread } from '@/utils/threadGeneration';
import { TwitterAutomation } from '@/utils/twitterAutomation';

// GET endpoint for checking API status
export async function GET() {
  return NextResponse.json({ status: 'API is running' });
}

// POST endpoint for analyzing tweets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    // Handle different actions
    switch (action) {
      case 'analyze':
        if (!data.tweetText) {
          return NextResponse.json(
            { error: 'Tweet text is required' },
            { status: 400 }
          );
        }
        const analysis = analyzeTweet(data.tweetText);
        return NextResponse.json({ analysis });

      case 'generate':
        if (!data.topic) {
          return NextResponse.json(
            { error: 'Topic is required' },
            { status: 400 }
          );
        }
        const thread = await generateThread(data.topic, {
          followUpCount: data.followUpCount || 3,
          style: data.style || null,
          includeCTA: data.includeCTA !== false,
        });
        return NextResponse.json({ thread });

      case 'post':
        if (!data.tweets || !Array.isArray(data.tweets) || data.tweets.length === 0) {
          return NextResponse.json(
            { error: 'Tweets array is required' },
            { status: 400 }
          );
        }
        if (!data.credentials || !data.credentials.username || !data.credentials.password) {
          return NextResponse.json(
            { error: 'Twitter credentials are required' },
            { status: 400 }
          );
        }

        const twitter = new TwitterAutomation({
          username: data.credentials.username,
          password: data.credentials.password,
          headless: data.headless !== false,
        });

        try {
          const results = await twitter.postThread(data.tweets, {
            mediaFiles: data.mediaFiles,
            scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : undefined,
          });
          await twitter.close();
          return NextResponse.json({ results });
        } catch (error) {
          await twitter.close();
          throw error;
        }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "analyze", "generate", or "post"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
