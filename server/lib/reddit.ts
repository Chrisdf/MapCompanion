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
    // Reddit search URL using the hotel name
    const query = encodeURIComponent(`"${hotelName}"`);
    const url = `https://www.reddit.com/search.json?q=${query}&sort=relevance&t=all`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'node:hotel-review-aggregator:v1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Reddit data');
    }

    const data = await response.json();
    const comments: RedditComment[] = [];

    // Process search results
    for (const post of data.data.children) {
      const item = post.data;
      if (item.selftext && item.selftext.toLowerCase().includes(hotelName.toLowerCase())) {
        comments.push({
          id: item.id,
          content: item.selftext,
          url: `https://reddit.com${item.permalink}`,
          score: item.score,
          created: item.created_utc,
          subreddit: item.subreddit_name_prefixed,
        });
      }
    }

    return comments;
  } catch (error) {
    console.error('Error fetching Reddit comments:', error);
    return [];
  }
}
