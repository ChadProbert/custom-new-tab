/**
 * Feedback Modal Functionality
 *
 * This file handles the feedback modal, form submission, and email functionality.
 * It allows users to submit feedback directly from the app which is then emailed
 * to the developer.
 */

// Initialize EmailJS with a public key when the script loads
emailjs.init({
  publicKey: "YbS029vg8L512hed1",
  // Block headless browsers to prevent automated submissions
  blockHeadless: true,
});

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const feedbackButton = document.getElementById("feedbackButton");
  const feedbackModal = document.getElementById("feedbackModal");
  const closeModalBtn = document.getElementById("closeFeedbackModal");
  const cancelFeedback = document.getElementById("cancelFeedback");
  const feedbackForm = document.getElementById("feedbackForm");
  const feedbackStatus = document.getElementById("feedbackStatus");

  /**
   * Opens the feedback modal
   */
  function openFeedbackModal() {
    feedbackModal.style.display = "flex";
    // Reset form and status message when opening
    feedbackForm.reset();
    feedbackStatus.className = "feedback-status";
    feedbackStatus.textContent = "";
    feedbackStatus.style.display = "none";
  }

  /**
   * Closes the feedback modal
   */
  function closeFeedbackModal() {
    feedbackModal.style.display = "none";
  }

  /**
   * Sets a status message on the form
   * @param {string} message - The message to display
   * @param {string} type - The type of message ('success' or 'error')
   */
  function setFeedbackStatus(message, type) {
    feedbackStatus.textContent = message;
    feedbackStatus.className = `feedback-status ${type}`;
    feedbackStatus.style.display = "block";
  }

  /**
   * Handles form submission
   * @param {Event} e - Form submission event
   */
  async function handleFormSubmit(e) {
    e.preventDefault();

    // Get form data
    const feedbackType = document.getElementById("feedbackType").value;
    const feedbackMessage = document.getElementById("feedbackMessage").value;
    const feedbackContact = document.getElementById("feedbackContact").value;

    // Validate required fields
    if (!feedbackType || !feedbackMessage) {
      setFeedbackStatus("Please fill in all required fields.", "error");
      return;
    }

    try {
      // Disable submit button and show loading state
      const submitButton = document.querySelector(".feedback-submit");
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = "Sending...";
      submitButton.disabled = true;

      // Prepare data for email service
      const formData = {
        type: feedbackType,
        message: feedbackMessage,
        contact: feedbackContact || "Anonymous",
        date: new Date().toLocaleString(),
        userAgent: navigator.userAgent,
      };

      // Send using Email.js service
      await sendFeedbackEmail(formData);

      // Show success message
      setFeedbackStatus(
        "Thank you for your feedback! We've received your message.",
        "success"
      );

      // Reset form after successful submission
      feedbackForm.reset();

      // Close modal after 3 seconds
      setTimeout(() => {
        closeFeedbackModal();
      }, 3000);
    } catch (error) {
      console.error("Error sending feedback:", error);
      setFeedbackStatus(
        "There was an error sending your feedback. Please try again later.",
        "error"
      );
    } finally {
      // Re-enable submit button
      const submitButton = document.querySelector(".feedback-submit");
      submitButton.textContent = "Submit Feedback";
      submitButton.disabled = false;
    }
  }

  /**
   * Sends feedback email using the Email.js service
   * @param {Object} formData - The form data to send
   * @returns {Promise} - Promise that resolves when email is sent
   */
  function sendFeedbackEmail(formData) {
    // Prepare template parameters
    const templateParams = {
      feedbackType: formData.type,
      feedbackMessage: formData.message,
      feedbackContact: formData.contact,
      feedbackDate: formData.date,
      feedbackUserAgent: formData.userAgent,
    };

    // Send the email using EmailJS
    return emailjs
      .send("service_2t29umi", "template_feedback", templateParams)
      .then(function (response) {
        console.log("Email sent successfully:", response);
        return response;
      })
      .catch(function (error) {
        console.error("Email sending failed:", error);
        throw error;
      });
  }

  // Event Listeners
  if (feedbackButton) {
    feedbackButton.addEventListener("click", openFeedbackModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeFeedbackModal);
  }

  if (cancelFeedback) {
    cancelFeedback.addEventListener("click", closeFeedbackModal);
  }

  if (feedbackForm) {
    feedbackForm.addEventListener("submit", handleFormSubmit);
  }

  // Close modal when clicking outside of it
  window.addEventListener("click", function (event) {
    if (event.target === feedbackModal) {
      closeFeedbackModal();
    }
  });

  // Close modal on escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && feedbackModal.style.display === "flex") {
      closeFeedbackModal();
    }
  });
});

/* References:
https://www.youtube.com/watch?v=BgVjild0C9A
https://www.emailjs.com/docs/sdk/installation/
https://www.emailjs.com/docs/sdk/send/
*/
