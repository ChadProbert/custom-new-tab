// Configuration for the new tab page
const CONFIG = {
  commandPathDelimiter: "/",
  commandSearchDelimiter: " ",
  // Controls search engine.
  // DuckDuckGo: https://duckduckgo.com/?q={}
  defaultSearchTemplate: "https://www.google.com/search?q={}",
  openLinksInNewTab: true,
  suggestionLimit: 4,
};

// Command definitions for keyboard shortcuts
const COMMANDS = new Map([
  [
    "g",
    { name: "Gmail", url: "https://mail.google.com/mail/u/0/#inbox" },
  ],
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
      suggestions: [
        "c/reviewer/completed/",
        "c/reviewer/returned_reviews/",
      ],
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

// Function to save commands to localStorage
function saveCommands() {
  const commandsObj = Object.fromEntries(COMMANDS);
  localStorage.setItem("commands", JSON.stringify(commandsObj));
}

// Function to load commands from localStorage
function loadCommands() {
  const commandsStr = localStorage.getItem("commands");
  if (commandsStr) {
    const commandsObj = JSON.parse(commandsStr);
    for (const [key, value] of Object.entries(commandsObj)) {
      COMMANDS.set(key, value);
    }
  }
} 