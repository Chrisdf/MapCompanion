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

// Helper function to add delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
        try {
          // Add delay between requests to avoid rate limiting
          await delay(1000);

          const query = encodeURIComponent(searchTerm);
          const url = `https://old.reddit.com/r/${subreddit}/search/.json?q=${query}&restrict_sr=on&include_over_18=off&sort=relevance&t=all&limit=10`;

          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (!data.data?.children) {
            console.warn(`No data found for ${searchTerm} in ${subreddit}`);
            continue;
          }

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
              // Extract relevant sentences containing the hotel name
              const sentences = textToSearch.split(/[.!?]+/);
              const relevantSentences = sentences
                .filter(s => s.toLowerCase().includes(hotelNameLower))
                .join('. ');

              if (relevantSentences) {
                comments.push({
                  id: item.id,
                  content: relevantSentences.trim(),
                  url: `https://reddit.com${item.permalink}`,
                  score: item.score,
                  created: item.created_utc,
                  subreddit: item.subreddit_name_prefixed,
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error searching ${subreddit} for ${searchTerm}:`, error);
          // Continue with next subreddit/term instead of failing completely
          continue;
        }
      }
    }

    // Remove duplicates and sort by score
    const uniqueComments = Array.from(
      new Map(comments.map(comment => [comment.id, comment])).values()
    );

    return uniqueComments.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error in searchRedditComments:', error);
    return [];
  }
}