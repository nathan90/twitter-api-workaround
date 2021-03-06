import queryString from "query-string";
import config from "../config.json";
import Twit from "twit";

const T = new Twit(config);

/**
 * Thenable function to retrieve twitter trends.
 * @function getTrends
 * @param {string} id - `where on earth id` of location.(yahoo woeid)
 * @returns {Promise} - Promise or resolved/rejected value.
 */
const getTrends = (id) => {
  return new Promise((resolve, reject) => {
    T.get("trends/place", { id }, (err, data) => {
      if (err) reject(err);
      if (data && data.length && data[0].trends) {
        resolve(data[0].trends);
      } else resolve([]);
    });
  });
};

/**
 * Helper function to search tweets
 * @function fetchTweets
 * @param {object} params - search parameters
 * @return {Promise} - twitter API response.
 */
const fetchTweets = (params) => {
  return new Promise((res, rej) => {
    T.get("search/tweets", params, (err, data) => {
      if (err) rej(err);
      else res(data);
    });
  });
};

/**
 * Thenable function to retrieve twitter tweets.
 * @function getTweets
 * @param {string} query - url query parameter to search tweets.
 * @param {maxTweetCount} - maximum tweets needed to analyze.
 * @returns {Promise} - Resolved value : Array of tweets
 */
const getTweets = async (query, maxTweetCount = 100) => {
  return new Promise((resolve, reject) => {
    try {
      let tweetsToFetch = maxTweetCount;
      let params = { q: query, count: 100 };
      const tweets = [];

      // Recursive function to fetch paginated tweets
      const trigger = async () => {
        const tweetData = await fetchTweets(params);
        if (tweetData.statuses.length && tweetsToFetch > 0) {
          tweets.push(...tweetData.statuses);
          tweetsToFetch -= tweetData.statuses.length;

          const nextFetchQuery = queryString.parse(
            tweetData.search_metadata.next_results
          );

          params.count = tweetsToFetch < 100 ? tweetsToFetch : 100;
          params.max_id = nextFetchQuery.max_id;
          trigger();
        } else resolve(tweets);
      };
      trigger();
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  getTrends,
  getTweets
};
