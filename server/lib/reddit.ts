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
    // Search in travel-related subreddits
    const subreddits = ['JapanTravel', 'JapanTravelTips', 'japanlife', 'Tokyo'];
    const comments: RedditComment[] = [];

    for (const subreddit of subreddits) {
      // Reddit search URL using the hotel name
      const query = encodeURIComponent(`subreddit:${subreddit} "${hotelName}"`);
      const url = `https://www.reddit.com/search.json?q=${query}&sort=relevance&t=all&type=comment,link&limit=10`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'web:hotel-review-aggregator:v1.0 (by /u/hotel_review_bot)'
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
        const textToSearch = [item.title, item.selftext].filter(Boolean).join(' ').toLowerCase();
        if (textToSearch.includes(hotelName.toLowerCase())) {
          comments.push({
            id: item.id,
            content: item.selftext || item.title,
            url: `https://reddit.com${item.permalink}`,
            score: item.score,
            created: item.created_utc,
            subreddit: item.subreddit_name_prefixed,
          });
        }
      }
    }

    return comments;
  } catch (error) {
    console.error('Error fetching Reddit comments:', error);
    return [];
  }
}