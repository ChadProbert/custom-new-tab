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
   * Search engine templates.
   * The {} placeholder will be replaced with the search query.
   */
  searchEngineTemplates: {
    google: "https://www.google.com/search?q={}",
    duckduckgo: "https://duckduckgo.com/?q={}",
  },

  /** Default search engine (can be 'google' or 'duckduckgo') */
  defaultSearchEngine: "google",

  /** Whether links should open in new tabs (default is true - open in new tab) */
  openLinksInNewTab: true,

  /** Maximum number of search suggestions to display */
  suggestionLimit: 4,

  /** Initialize settings from localStorage */
  init: function () {
    // Load tab behavior setting
    const tabBehavior = localStorage.getItem("tabBehavior");
    if (tabBehavior !== null) {
      this.openLinksInNewTab = tabBehavior === "new";
    }

    // Load search engine setting
    const searchEngine = localStorage.getItem("searchEngine");
    if (searchEngine !== null && this.searchEngineTemplates[searchEngine]) {
      this.defaultSearchEngine = searchEngine;
    }

    // Set the defaultSearchTemplate based on the engine
    this.defaultSearchTemplate =
      this.searchEngineTemplates[this.defaultSearchEngine];
  },
};

// Initialize settings when the script loads
CONFIG.init();

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
