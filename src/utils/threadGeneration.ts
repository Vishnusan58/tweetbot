/**
 * Thread Generation Utility
 * 
 * This module provides functions for generating Twitter threads based on analyzed styles and patterns.
 */

import { analyzeTweet } from './tweetAnalysis';
import { OpenAI } from "openai";

// LLM interface
interface LLMResponse {
  text: string;
}

// Initialize the OpenAI client
const openai_client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "<your-API-key>",
});

/**
 * Calls the OpenAI LLM API
 * @param prompt The prompt to send to the LLM
 * @returns Promise resolving to the LLM response
 */
async function callLLM(prompt: string): Promise<LLMResponse> {
  console.log('LLM Prompt:', prompt);

  try {
    const response = await openai_client.chat.completions.create({
      model: process.env.OPENAI_MODEL_ID || "gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt }
      ]
    });

    // Extract the generated text from the response
    const generatedText = response.choices[0]?.message?.content || 
      `Failed to generate content for: ${prompt.substring(0, 50)}...`;

    return {
      text: generatedText
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    // Fallback response in case of error
    return {
      text: `Error generating content. Please try again later.`
    };
  }
}

/**
 * Generates a prompt using the LLM itself
 * @param promptType The type of prompt to generate (hook, followup, cta)
 * @param context Additional context for prompt generation
 * @returns Generated prompt
 */
async function generatePrompt(promptType: 'hook' | 'followup' | 'cta', context: any): Promise<string> {
  const metaPrompt = `
    You are an expert at creating effective prompts for generating Twitter content.
    I need you to create a detailed prompt that will be used to generate a ${promptType} tweet.

    Here's the context:
    - Topic: ${context.topic}
    ${context.style ? `- Style preferences: ${JSON.stringify(context.style)}` : ''}
    ${context.hookTweet ? `- Hook tweet: "${context.hookTweet}"` : ''}
    ${context.previousTweet ? `- Previous tweet: "${context.previousTweet}"` : ''}
    ${context.tweetNumber ? `- This is tweet #${context.tweetNumber} in the thread` : ''}

    Your task is to create a prompt that will guide an AI to generate a compelling ${promptType} tweet.
    The prompt should include specific instructions about:
    - The tone and style to use
    - Any formatting considerations
    - Character limits (tweets must be under 280 characters)
    - What makes a good ${promptType} tweet

    Return ONLY the prompt text, without any explanations or meta-commentary.
  `;

  const response = await callLLM(metaPrompt);
  console.log(`Generated ${promptType} prompt:`, response.text);
  return response.text;
}

/**
 * Generates a hook tweet based on a topic and style
 * @param topic The topic to tweet about
 * @param style Optional style parameters to guide generation
 * @returns Generated hook tweet
 */
export async function generateHookTweet(topic: string, style?: any): Promise<string> {
  // Generate a prompt for hook tweet using the LLM
  const generatedPrompt = await generatePrompt('hook', { topic, style });

  // Use the generated prompt to create the hook tweet
  const response = await callLLM(generatedPrompt);
  return response.text;
}

/**
 * Generates follow-up tweets for a thread
 * @param topic The main topic of the thread
 * @param hookTweet The hook tweet that starts the thread
 * @param numTweets Number of follow-up tweets to generate
 * @param style Optional style parameters
 * @returns Array of generated follow-up tweets
 */
export async function generateFollowUpTweets(
  topic: string,
  hookTweet: string,
  numTweets: number = 3,
  style?: any
): Promise<string[]> {
  const followUpTweets: string[] = [];

  // Analyze the hook tweet to maintain consistent style
  const hookAnalysis = analyzeTweet(hookTweet);

  for (let i = 0; i < numTweets; i++) {
    // Generate a prompt for follow-up tweet using the LLM
    const generatedPrompt = await generatePrompt('followup', {
      topic,
      hookTweet,
      previousTweet: i > 0 ? followUpTweets[i - 1] : undefined,
      tweetNumber: i + 2,
      style: {
        ...(style || {}),
        contentType: style?.contentType || hookAnalysis.contentType,
        emojiUsage: hookAnalysis.structure.emojiCount > 0 ? 'Include emojis' : 'Minimal emojis',
        formatting: hookAnalysis.style.formatting.usesBulletPoints ? 'Use bullet points' : 'No bullet points'
      }
    });

    // Use the generated prompt to create the follow-up tweet
    const response = await callLLM(generatedPrompt);
    followUpTweets.push(response.text);
  }

  return followUpTweets;
}

/**
 * Generates a CTA (Call to Action) tweet to end a thread
 * @param topic The main topic of the thread
 * @param style Optional style parameters
 * @returns Generated CTA tweet
 */
export async function generateCTATweet(topic: string, style?: any): Promise<string> {
  // Generate a prompt for CTA tweet using the LLM
  const generatedPrompt = await generatePrompt('cta', { 
    topic, 
    style,
    ctaTypes: [
      'Follow for more content',
      'Share the thread',
      'Like the thread',
      'Comment with questions',
      'Visit a website (hypothetical)'
    ]
  });

  // Use the generated prompt to create the CTA tweet
  const response = await callLLM(generatedPrompt);
  return response.text;
}

/**
 * Generates a complete Twitter thread
 * @param topic The topic for the thread
 * @param options Configuration options
 * @returns Complete generated thread as an array of tweets
 */
export async function generateThread(
  topic: string,
  options: {
    followUpCount?: number;
    style?: any;
    includeCTA?: boolean;
  } = {}
): Promise<string[]> {
  const { followUpCount = 3, style = null, includeCTA = true } = options;

  // Generate the hook tweet
  const hookTweet = await generateHookTweet(topic, style);

  // Generate follow-up tweets
  const followUpTweets = await generateFollowUpTweets(topic, hookTweet, followUpCount, style);

  // Generate CTA tweet if requested
  const thread = [hookTweet, ...followUpTweets];

  if (includeCTA) {
    const ctaTweet = await generateCTATweet(topic, style);
    thread.push(ctaTweet);
  }

  return thread;
}
