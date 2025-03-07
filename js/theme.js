// Theme switching functionality
document.addEventListener("DOMContentLoaded", () => {
  const themeSelect = document.getElementById("themeSelect");

  // Load the saved theme from localStorage
  const savedTheme = localStorage.getItem("selectedTheme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeSelect.value = savedTheme;

  // Theme switching logic
  themeSelect.addEventListener("change", (event) => {
    const selectedTheme = event.target.value;
    document.documentElement.setAttribute("data-theme", selectedTheme);
    localStorage.setItem("selectedTheme", selectedTheme);
  });
}); 