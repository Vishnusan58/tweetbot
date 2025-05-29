/**
 * Tweet Analysis Utility
 * 
 * This module provides functions for analyzing tweet styles, structures, and patterns.
 */

/**
 * Analyzes the structural elements of a tweet
 * @param tweetText The text content of the tweet
 * @returns Analysis of hooks, emojis, media placement, and CTAs
 */
export function analyzeStructure(tweetText: string) {
  // Extract hooks (typically the first sentence or line)
  const lines = tweetText.split('\n');
  const hook = lines[0];
  
  // Count emojis
  const emojiRegex = /[\p{Emoji}]/gu;
  const emojis = tweetText.match(emojiRegex) || [];
  
  // Detect CTAs (common call-to-action phrases)
  const ctaPatterns = [
    /follow/i, /share/i, /like/i, /retweet/i, /comment/i, 
    /subscribe/i, /join/i, /click/i, /check out/i, /learn more/i
  ];
  const hasCTA = ctaPatterns.some(pattern => pattern.test(tweetText));
  
  // Detect media references
  const hasMediaReference = /pic\.twitter|photo|image|video|watch|see below/i.test(tweetText);
  
  return {
    hook,
    emojiCount: emojis.length,
    emojis: emojis.join(''),
    hasCTA,
    hasMediaReference,
  };
}

/**
 * Analyzes the content type of a tweet
 * @param tweetText The text content of the tweet
 * @returns The detected content type
 */
export function analyzeContentType(tweetText: string) {
  // Define patterns for different content types
  const patterns = {
    promotional: /launch|new|introducing|announcement|released|now available|discount|offer|sale|limited time/i,
    educational: /learn|how to|guide|tutorial|tips|tricks|advice|explain|understanding/i,
    storytelling: /story|journey|experience|when I|started|learned|discovered|realized/i,
    question: /\?|what if|have you|do you|should you|could you|would you/i,
    statistic: /\d+%|\d+ percent|survey|study|research|data shows|according to/i,
  };
  
  // Check which patterns match the tweet
  const matchedTypes = Object.entries(patterns)
    .filter(([_, pattern]) => pattern.test(tweetText))
    .map(([type]) => type);
  
  // Return the primary content type (first match) or 'general' if none match
  return matchedTypes.length > 0 ? matchedTypes[0] : 'general';
}

/**
 * Analyzes the style characteristics of a tweet
 * @param tweetText The text content of the tweet
 * @returns Style analysis including sentence length, formatting, etc.
 */
export function analyzeStyle(tweetText: string) {
  // Split into sentences
  const sentences = tweetText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Calculate average sentence length
  const avgSentenceLength = sentences.length > 0 
    ? sentences.reduce((sum, s) => sum + s.trim().length, 0) / sentences.length 
    : 0;
  
  // Detect formatting patterns
  const formatting = {
    usesBulletPoints: /•|\*|-|✅|✓|✔️|1\.|2\.|3\./.test(tweetText),
    usesNumberedList: /1\.|2\.|3\.|\d+\)/.test(tweetText),
    usesAllCaps: /[A-Z]{3,}/.test(tweetText),
    usesBold: /\*\*[^*]+\*\*/.test(tweetText),
    usesItalics: /\*[^*]+\*|_[^_]+_/.test(tweetText),
    usesLineBreaks: tweetText.split('\n').length > 1,
  };
  
  return {
    sentenceCount: sentences.length,
    avgSentenceLength,
    formatting,
    tweetLength: tweetText.length,
  };
}

/**
 * Comprehensive analysis of a tweet
 * @param tweetText The text content of the tweet
 * @returns Complete analysis of the tweet
 */
export function analyzeTweet(tweetText: string) {
  return {
    structure: analyzeStructure(tweetText),
    contentType: analyzeContentType(tweetText),
    style: analyzeStyle(tweetText),
  };
}