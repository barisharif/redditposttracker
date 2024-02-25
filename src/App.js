import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

const redditBaseURL = "https://www.reddit.com";

export default function App() {
  const [inputValue, setInputValue] = useState(""); // State to hold the input value
  const [subreddit, setSubreddit] = useState(""); // State to hold the subreddit to be searched
  const [posts, setPosts] = useState([]);
  const [subredditIcon, setSubredditIcon] = useState('');
  const [favoriteIds, setFavoriteIds] = useLocalStorage("favorites", []);
  const [favoritePosts, setFavoritePosts] = useState([]);

  // Effect for fetching subreddit posts and icon
  useEffect(() => {
    if (!subreddit) return; // Only proceed if subreddit is not empty

    // Fetch subreddit posts
    fetch(`${redditBaseURL}/r/${subreddit}/hot.json?limit=10`)
      .then(response => response.json())
      .then(data => {
        const formattedPosts = data.data.children.map(post => ({
          id: post.data.id,
          title: post.data.title,
          score: post.data.score,
          commentsLink: `https://www.reddit.com${post.data.permalink}`,
        }));
        setPosts(formattedPosts);
      })
      .catch(error => console.error("Error fetching posts:", error));

    // Fetch subreddit icon
    fetch(`${redditBaseURL}/r/${subreddit}/about.json`)
      .then(response => response.json())
      .then(data => {
        setSubredditIcon(data.data.icon_img || '');
      })
      .catch(error => console.error("Error fetching subreddit icon:", error));

  }, [subreddit]);



  useEffect(() => {
    if (favoriteIds.length > 0) {
      fetchFavoritePostsDetails(favoriteIds);
    } else {
      setFavoritePosts([]); // Clear favorite posts if there are no favorite IDs
    }
  }, [favoriteIds]);

  function handleAddFavorite(post) {
    if (!favoriteIds.some(favoriteId => favoriteId === post.id)) {
      setFavoriteIds([...favoriteIds, post.id]);
    }
  }

  function handleRemoveFavorite(postId) {
    setFavoriteIds(favoriteIds.filter(id => id !== postId));
  }

  function fetchFavoritePostsDetails(favoriteIds) {
    const idsQueryString = favoriteIds.map(id => `t3_${id}`).join(',');
    fetch(`${redditBaseURL}/api/info.json?id=${idsQueryString}`)
      .then((response) => response.json())
      .then((data) => {
        const formattedFavorites = data.data.children.map((post) => ({
          id: post.data.id,
          title: post.data.title,
          score: post.data.score,
          commentsLink: `https://www.reddit.com${post.data.permalink}`,
        }));
        setFavoritePosts(formattedFavorites);
      })
      .catch((error) => console.error("Error fetching favorite posts details:", error));
  }

  // Function to truncate titles longer than 150 characters
  const truncateTitle = (title) => title.length > 150 ? title.substring(0, 150) + "..." : title;


  const handleSearch = (e) => {
    e.preventDefault(); // Prevent form submission
    setSubreddit(inputValue); // Trigger search
  };


return (
    <>
      <div className="app-title">
        <h1>Jay's Reddit Post Tracker</h1>
      </div>
      <header className="header">
        {subredditIcon && <img src={subredditIcon} alt="Subreddit Icon" className="subreddit-icon" />}
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter subreddit..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="search"
          />
          <button type="submit" className="button">Search</button>
        </form>
      </header>
      <main>
        <section className="section">
          <h2>Top Posts</h2>
          <ul className="list">
            {posts.map((post) => (
              <li key={post.id}>
                <div>
                  <h3>{truncateTitle(post.title)}</h3> {/* Apply truncation here */}
                </div>
                <div className="post-actions">
                  <span>Score: {post.score}</span>
                  <a href={post.commentsLink} target="_blank" rel="noopener noreferrer">Comments</a>
                  <button className="button" onClick={() => handleAddFavorite(post)}>Add to Favorites</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="section">
          <h2>Favorites</h2>
          <ul className="list">
            {favoritePosts.map((post) => (
              <li key={post.id}>
                <div>
                  <h3>{truncateTitle(post.title)}</h3> {/* Apply truncation here */}
                </div>
                <div className="post-actions">
                  <span>Score: {post.score}</span>
                  <a href={post.commentsLink} target="_blank" rel="noopener noreferrer">Comments</a>
                  <button className="button button-delete" onClick={() => handleRemoveFavorite(post.id)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}