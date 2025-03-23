/**
 * Feedback Button Functionality
 *
 * This file handles the event listener for the feedback button.
 * When clicked, it opens an external form for users to provide feedback
 * on bugs or feature requests.
 */
document.addEventListener("DOMContentLoaded", function () {
  const feedbackButton = document.getElementById("feedbackButton");

  if (feedbackButton) {
    feedbackButton.addEventListener("click", function () {
      // Replace this URL with your actual feedback form URL when ready
      window.open(
        "https://docs.google.com/forms/d/e/1FAIpQLSde-jDiptv8BYZ8eQ-YmSyISq_rgVBX0mP779_caBzgxDasWg/viewform?usp=header",
        "_blank",
        "noopener,noreferrer"
      );
    });
  }
});
