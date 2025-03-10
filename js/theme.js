/**
 * Theme switching functionality for the application.
 * Handles theme selection, persistence, and application.
 */
document.addEventListener("DOMContentLoaded", () => {
  /**
   * Theme selection dropdown element
   * @type {HTMLSelectElement}
   */
  const themeSelect = document.getElementById("themeSelect");

  // Load the saved theme from localStorage
  const savedTheme = localStorage.getItem("selectedTheme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeSelect.value = savedTheme;

  /**
   * Event handler for theme selection changes.
   * Updates the document theme attribute and saves the selection to localStorage.
   * @param {Event} event - Change event from the theme select dropdown
   */
  const handleThemeChange = (event) => {
    const selectedTheme = event.target.value;
    document.documentElement.setAttribute("data-theme", selectedTheme);
    localStorage.setItem("selectedTheme", selectedTheme);
  };

  // Theme switching logic
  themeSelect.addEventListener("change", handleThemeChange);
});
