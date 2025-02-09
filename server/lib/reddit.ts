import { z } from "zod";

// Schema for Reddit comment data
export const redditCommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  url: z.string(),
  score: z.number(),
  created: z.number(),
  subreddit: z.string(),
});

export type RedditComment = z.infer<typeof redditCommentSchema>;

// Function to search Reddit comments for a hotel
export async function searchRedditComments(hotelName: string): Promise<RedditComment[]> {
  try {
    // Create search variations of the hotel name
    const searchTerms = [
      hotelName,
      hotelName.replace(/hotel\s+/i, ''),  // Remove "hotel" prefix if present
      hotelName.replace(/\s+tokyo/i, '')   // Remove "tokyo" suffix if present
    ];

    const comments: RedditComment[] = [];
    const subreddits = ['JapanTravel', 'JapanTravelTips', 'japanlife', 'Tokyo'];

    for (const subreddit of subreddits) {
      for (const searchTerm of searchTerms) {
        // Use Reddit's new API endpoint
        const query = encodeURIComponent(`${searchTerm}`);
        const url = `https://old.reddit.com/r/${subreddit}/search.json?q=${query}&restrict_sr=on&sort=relevance&t=all&limit=25`;

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; HotelReviewBot/1.0; +http://example.com)'
          }
        });

        if (!response.ok) {
          console.error(`Failed to fetch from subreddit ${subreddit}:`, response.status);
          continue;
        }

        const data = await response.json();

        // Process search results
        for (const post of data.data.children) {
          const item = post.data;

          // Check both title and selftext (body) for hotel mentions
          const textToSearch = [
            item.title || '',
            item.selftext || ''
          ].join(' ').toLowerCase();

          const hotelNameLower = searchTerm.toLowerCase();
          if (textToSearch.includes(hotelNameLower)) {
            // Extract the relevant part of the text containing the hotel mention
            const sentences = textToSearch.split(/[.!?]+/);
            const relevantSentences = sentences.filter(s => 
              s.includes(hotelNameLower)
            ).join('. ');

            comments.push({
              id: item.id,
              content: relevantSentences || item.title || item.selftext,
              url: `https://reddit.com${item.permalink}`,
              score: item.score,
              created: item.created_utc,
              subreddit: item.subreddit_name_prefixed,
            });
          }
        }
      }
    }

    // Remove duplicates based on comment ID
    const uniqueComments = Array.from(
      new Map(comments.map(comment => [comment.id, comment])).values()
    );

    // Sort by score (most upvoted first)
    return uniqueComments.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error fetching Reddit comments:', error);
    return [];
  }
}