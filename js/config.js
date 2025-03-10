// Configuration for the new tab page

/**
 * Global configuration object for the new tab page.
 * Contains settings for command delimiters, search templates, and display options.
 * @type {Object}
 */
const CONFIG = {
  /** Delimiter character for path-based commands (e.g., r/subreddit) */
  commandPathDelimiter: "/",

  /** Delimiter character for search commands (e.g., g search term) */
  commandSearchDelimiter: " ",

  /**
   * Default search engine template.
   * The {} placeholder will be replaced with the search query.
   * Options:
   * - DuckDuckGo: https://duckduckgo.com/?q={}
   * - Google: https://www.google.com/search?q={}
   */
  defaultSearchTemplate: "https://www.google.com/search?q={}",

  /** Whether links should open in new tabs */
  openLinksInNewTab: true,

  /** Maximum number of search suggestions to display */
  suggestionLimit: 4,
};

/**
 * Command definitions for keyboard shortcuts.
 * Each command is defined with a key (shortcut) and an object containing:
 * - name: The display name for the shortcut
 * - url: The URL to navigate to
 * - searchTemplate (optional): The search path template with {} placeholder
 * - suggestions (optional): Array of search suggestions related to this command
 * @type {Map<string, Object>}
 */
const COMMANDS = new Map([
  ["g", { name: "Gmail", url: "https://mail.google.com/mail/u/0/#inbox" }],
  // Column 1
  [
    "y",
    {
      name: "YouTube",
      searchTemplate: "/results?search_query={}",
      suggestions: ["y/feed/subscriptions"],
      url: "https://youtube.com/",
    },
  ],
  [
    "m",
    {
      name: "Metabase",
      url: "https://metabase.hyperiondev.com/dashboard/157-my-dashboard",
    },
  ],
  // Column 2
  ["d", { name: "Dropbox", url: "https://www.dropbox.com/work" }],
  [
    "a",
    {
      name: "Chat",
      searchTemplate: "/?q={}",
      url: "https://chat.openai.com/chat",
    },
  ],
  ["n", { name: "Netflix", url: "https://www.netflix.com/browse" }],
  // Column 3
  [
    "c",
    {
      name: "Cogrammer",
      suggestions: ["c/reviewer/completed/", "c/reviewer/returned_reviews/"],
      url: "https://hyperiondev.cogrammar.com/",
    },
  ],
  ["l", { name: "Localhost", url: "http://localhost:3000" }],
  ["gh", { name: "GitHub", url: "https://github.com/" }],
  // Column 4
  [
    "k",
    {
      name: "Knowledge",
      url: "https://sites.google.com/hyperiondev.com/hyperiondev-kb/home?authuser=0",
    },
  ],
  [
    "r",
    {
      name: "Reddit",
      suggestions: [
        "r/r/webdev",
        "r/r/learnprogramming",
        "r/r/gamedev",
        "r/r/LifeProTips/",
      ],
      url: "https://reddit.com",
    },
  ],
  [
    "s",
    {
      name: "Spotify",
      searchTemplate: "/search/{}",
      url: "https://open.spotify.com",
    },
  ],
]);

/**
 * Saves the current commands to localStorage for persistence.
 * Converts the Map to a JSON object for storage.
 */
function saveCommands() {
  const commandsObj = Object.fromEntries(COMMANDS);
  localStorage.setItem("commands", JSON.stringify(commandsObj));
}

/**
 * Loads saved commands from localStorage.
 * Restores the commands Map from the saved JSON.
 */
function loadCommands() {
  const commandsStr = localStorage.getItem("commands");
  if (commandsStr) {
    const commandsObj = JSON.parse(commandsStr);
    for (const [key, value] of Object.entries(commandsObj)) {
      COMMANDS.set(key, value);
    }
  }
}
