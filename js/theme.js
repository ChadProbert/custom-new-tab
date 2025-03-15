/**
 * Theme switching functionality for the application.
 * Handles theme selection, persistence, and application.
 * Also handles other application settings like tab behavior and search engine selection.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Element selectors
  const themeSelect = document.getElementById("themeSelect");
  const tabBehaviorNew = document.getElementById("tabBehaviorNew");
  const tabBehaviorCurrent = document.getElementById("tabBehaviorCurrent");
  const searchEngineGoogle = document.getElementById("searchEngineGoogle");
  const searchEngineDuckDuckGo = document.getElementById("searchEngineDuckDuckGo");

  // THEME SETTINGS
  // Load the saved theme from localStorage
  const savedTheme = localStorage.getItem("selectedTheme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeSelect.value = savedTheme;

  // TAB BEHAVIOR SETTINGS
  // Load the saved tab behavior
  const savedTabBehavior = localStorage.getItem("tabBehavior") || (CONFIG.openLinksInNewTab ? "new" : "current");
  if (savedTabBehavior === "new") {
    tabBehaviorNew.checked = true;
  } else {
    tabBehaviorCurrent.checked = true;
  }

  // SEARCH ENGINE SETTINGS
  // Load the saved search engine
  const savedSearchEngine = localStorage.getItem("searchEngine") || CONFIG.defaultSearchEngine;
  if (savedSearchEngine === "google") {
    searchEngineGoogle.checked = true;
  } else {
    searchEngineDuckDuckGo.checked = true;
  }

  // EVENT HANDLERS
  // Theme change handler
  const handleThemeChange = (event) => {
    const selectedTheme = event.target.value;
    document.documentElement.setAttribute("data-theme", selectedTheme);
    localStorage.setItem("selectedTheme", selectedTheme);
  };

  // Tab behavior change handler
  const handleTabBehaviorChange = (event) => {
    const selectedBehavior = event.target.value;
    localStorage.setItem("tabBehavior", selectedBehavior);
    CONFIG.openLinksInNewTab = selectedBehavior === "new";
    
    // Reload commands to apply new tab behavior
    document.querySelector("commands-component")?.render();
  };

  // Search engine change handler
  const handleSearchEngineChange = (event) => {
    const selectedEngine = event.target.value;
    localStorage.setItem("searchEngine", selectedEngine);
    CONFIG.defaultSearchEngine = selectedEngine;
    CONFIG.defaultSearchTemplate = CONFIG.searchEngineTemplates[selectedEngine];
  };

  // Add event listeners
  themeSelect.addEventListener("change", handleThemeChange);
  
  // Add radio button event listeners
  document.querySelectorAll('input[name="tabBehavior"]').forEach(radio => {
    radio.addEventListener('change', handleTabBehaviorChange);
  });
  
  document.querySelectorAll('input[name="searchEngine"]').forEach(radio => {
    radio.addEventListener('change', handleSearchEngineChange);
  });
});
