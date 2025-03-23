/**
 * Feedback Button Functionality
 *
 * This file handles the event listener for the feedback button.
 * When clicked, it opens an external form for users to provide feedback
 * on bugs or feature requests.
 *
 * TODO: Replace the URL with the actual feedback form URL when ready.
 */
document.addEventListener("DOMContentLoaded", function () {
  const feedbackButton = document.getElementById("feedbackButton");

  if (feedbackButton) {
    feedbackButton.addEventListener("click", function () {
      // Replace this URL with your actual feedback form URL when ready
      window.open(
        "https://your-feedback-form-url.com",
        "_blank",
        "noopener,noreferrer"
      );
    });
  }
});
