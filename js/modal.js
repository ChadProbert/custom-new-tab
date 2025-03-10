/**
 * Modal functionality for the application.
 * Handles all modal-related interactions including settings and help modals.
 */
class ModalManager {
  /**
   * Initializes the ModalManager with all required DOM elements and event bindings.
   * Sets up the modal overlay, settings modal, help modal, and form controls.
   */
  constructor() {
    // DOM elements
    this.openModalBtn = document.getElementById("openModal");
    this.openHelpBtn = document.getElementById("openHelp");
    this.closeModalBtn = document.getElementById("closeModal");
    this.closeHelpModalBtn = document.getElementById("closeHelpModal");
    this.settingsModal = document.getElementById("settingsModal");
    this.helpModal = document.getElementById("helpModal");
    this.modalOverlay = document.getElementById("modalOverlay");
    this.shortcutList = document.getElementById("shortcutList");
    this.themeSelect = document.getElementById("themeSelect");
    this.resetButton = document.getElementById("resetSettings");
    this.modalContent = document.querySelector(".modal-content");
    this.commandsComponent = document.querySelector("commands-component");

    // Track if we should focus on new shortcut inputs
    this.shouldFocusNewShortcut = false;

    // Default settings
    this.DEFAULT_SETTINGS = {
      theme: "dark",
      commands: new Map([
        [
          "g",
          { name: "Gmail", url: "https://mail.google.com/mail/u/0/#inbox" },
        ],
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
      ]),
    };

    // Bind methods
    this.handleFocusNewShortcut = this.handleFocusNewShortcut.bind(this);
    this.openSettingsModal = this.openSettingsModal.bind(this);
    this.openHelpModalHandler = this.openHelpModalHandler.bind(this);
    this.closeSettingsModal = this.closeSettingsModal.bind(this);
    this.closeHelpModal = this.closeHelpModal.bind(this);
    this.handleWindowClick = this.handleWindowClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.renderShortcuts = this.renderShortcuts.bind(this);
    this.resetSettings = this.resetSettings.bind(this);
    this.addNewShortcutField = this.addNewShortcutField.bind(this);
    this.checkModalScrollability = this.checkModalScrollability.bind(this);

    this.initializeEventListeners();
    this.initializeSettings();
  }

  /**
   * Sets up all event listeners for the modal functionality.
   * Includes opening/closing modals, resetting settings, and keyboard shortcuts.
   */
  initializeEventListeners() {
    // Listen for the custom event
    document.addEventListener("focusNewShortcut", this.handleFocusNewShortcut);

    // Open Settings Modal
    this.openModalBtn.addEventListener("click", this.openSettingsModal);

    // Open Help Modal
    this.openHelpBtn.addEventListener("click", this.openHelpModalHandler);

    // Close Settings Modal
    this.closeModalBtn.addEventListener("click", this.closeSettingsModal);

    // Close Help Modal
    this.closeHelpModalBtn.addEventListener("click", this.closeHelpModal);

    // Close Modal (clicking outside the modal content)
    window.addEventListener("click", this.handleWindowClick);

    // Close Modal with escape key
    document.addEventListener("keydown", this.handleKeydown);

    // Reset settings button
    this.resetButton.addEventListener("click", this.resetSettings);
  }

  /**
   * Initializes the application settings by loading saved commands
   * and rendering shortcuts and the commands component.
   */
  initializeSettings() {
    // Initialize by loading commands
    loadCommands();
    this.renderShortcuts();
    this.commandsComponent.render();
  }

  /**
   * Event handler for the focusNewShortcut custom event.
   * Sets the flag to focus on the new shortcut input field.
   */
  handleFocusNewShortcut() {
    this.shouldFocusNewShortcut = true;
  }

  /**
   * Opens the settings modal and handles focus management.
   * Closes any open search dialog, renders shortcuts, and sets focus
   * on the appropriate element based on context.
   */
  openSettingsModal() {
    // Close search dialog if it's open
    const searchComponent = document.querySelector("search-component");
    if (searchComponent) {
      const dialog = searchComponent.shadowRoot.querySelector(".dialog");
      if (dialog && dialog.open) {
        dialog.close();
      }
    }

    this.settingsModal.style.display = "flex";
    this.modalOverlay.classList.add("active"); // Activate background overlay
    this.renderShortcuts(); // Refresh shortcuts when opening modal

    // Focus based on context
    setTimeout(() => {
      if (this.shouldFocusNewShortcut) {
        // Focus the first input of the new shortcut section
        const lastShortcutItem = this.shortcutList.lastElementChild;
        if (lastShortcutItem) {
          const firstInput = lastShortcutItem.querySelector(".key-input");
          if (firstInput) {
            firstInput.focus();
          }
        }
        this.shouldFocusNewShortcut = false; // Reset the flag
      } else {
        // Default focus on theme dropdown
        if (this.themeSelect) {
          this.themeSelect.focus();
        }
      }
    }, 100); // A short delay to ensure the modal is fully rendered

    this.checkModalScrollability();
  }

  /**
   * Opens the help modal and handles any necessary cleanup.
   * Closes any open search dialog before displaying the help modal.
   */
  openHelpModalHandler() {
    // Close search dialog if it's open
    const searchComponent = document.querySelector("search-component");
    if (searchComponent) {
      const dialog = searchComponent.shadowRoot.querySelector(".dialog");
      if (dialog && dialog.open) {
        dialog.close();
      }
    }

    this.helpModal.style.display = "flex";
    this.modalOverlay.classList.add("active");
  }

  /**
   * Closes the settings modal and removes the overlay.
   */
  closeSettingsModal() {
    this.settingsModal.style.display = "none";
    this.modalOverlay.classList.remove("active");
  }

  /**
   * Closes the help modal and removes the overlay.
   */
  closeHelpModal() {
    this.helpModal.style.display = "none";
    this.modalOverlay.classList.remove("active");
  }

  /**
   * Handles clicks on the window to close modals when clicking outside modal content.
   * @param {Event} event - The click event
   */
  handleWindowClick(event) {
    if (
      event.target === this.settingsModal ||
      event.target === this.modalOverlay
    ) {
      this.settingsModal.style.display = "none";
      this.helpModal.style.display = "none";
      this.modalOverlay.classList.remove("active"); // Deactivate background overlay
    }

    if (event.target === this.helpModal) {
      this.helpModal.style.display = "none";
      this.modalOverlay.classList.remove("active");
    }
  }

  /**
   * Handles keyboard events to close modals when pressing Escape.
   * @param {KeyboardEvent} e - The keyboard event
   */
  handleKeydown(e) {
    if (e.key === "Escape") {
      this.settingsModal.style.display = "none";
      this.helpModal.style.display = "none";
      this.modalOverlay.classList.remove("active");
    }
  }

  /**
   * Renders the list of shortcuts in the modal.
   * Clears the current list, adds all existing shortcuts,
   * and adds a new shortcut field at the end.
   */
  renderShortcuts() {
    this.shortcutList.innerHTML = "";

    // Add each existing shortcut to the list
    for (const [key, value] of COMMANDS.entries()) {
      this.shortcutList.appendChild(this.createShortcutItem(key, value));
    }

    // Add new shortcut field
    this.addNewShortcutField();
  }

  /**
   * Creates a DOM element for a shortcut item with edit/delete functionality.
   * @param {string} key - The shortcut key
   * @param {Object} value - The shortcut value object containing name and URL
   * @returns {HTMLElement} The created shortcut item DOM element
   */
  createShortcutItem(key, value) {
    const shortcutItem = document.createElement("div");
    shortcutItem.classList.add("shortcut-item");

    // Create input for key
    const keyInput = document.createElement("input");
    keyInput.type = "text";
    keyInput.classList.add("key-input");
    keyInput.value = key;
    keyInput.readOnly = true;
    shortcutItem.appendChild(keyInput);

    // Create input for name
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.classList.add("name-input");
    nameInput.value = value.name || "";
    nameInput.readOnly = true;
    shortcutItem.appendChild(nameInput);

    // Create input for URL
    const valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.classList.add("value-input");
    valueInput.value = value.url || "";
    valueInput.readOnly = true;
    shortcutItem.appendChild(valueInput);

    // Create edit/save button
    const actionButton = document.createElement("button");
    actionButton.classList.add("edit-button");
    actionButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
    actionButton.title = "Edit shortcut";
    shortcutItem.appendChild(actionButton);

    // Create delete button
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteButton.title = "Delete shortcut";
    shortcutItem.appendChild(deleteButton);

    /**
     * Enables edit mode for this shortcut item.
     * Makes inputs editable, changes the action button to a save button,
     * and focuses the key input.
     */
    const enableEditMode = () => {
      keyInput.readOnly = false;
      nameInput.readOnly = false;
      valueInput.readOnly = false;
      keyInput.focus();
      actionButton.classList.remove("edit-button");
      actionButton.classList.add("save-button");
      actionButton.innerHTML = '<i class="fa-solid fa-check"></i>';
      actionButton.title = "Save changes";
    };

    /**
     * Saves the edited shortcut after validation.
     * Handles key conflicts with confirmation and updates the COMMANDS map.
     * @returns {Promise<boolean>} True if save was successful, false otherwise
     */
    const saveEditedShortcut = async () => {
      const newKey = keyInput.value.trim();
      const newName = nameInput.value.trim();
      const newValue = valueInput.value.trim();

      // Validation
      if (!newKey || !newName || !newValue) {
        return false;
      }

      // Check if key changed and if new key already exists
      if (newKey !== key && COMMANDS.has(newKey)) {
        const shouldOverride = await customConfirm({
          message: `The shortcut key "${newKey}" already exists. Are you sure you want to override it?`,
          confirmText: "Override",
          cancelText: "Cancel",
          confirmClass: "confirm-override",
        });

        if (!shouldOverride) {
          return false;
        }
      }

      // Delete old key if changed
      if (newKey !== key) {
        COMMANDS.delete(key);
      }

      // Update command
      COMMANDS.set(newKey, {
        ...value,
        name: newName,
        url: newValue,
      });

      // Save and refresh
      saveCommands();
      this.renderShortcuts();
      this.commandsComponent.render();
      return true;
    };

    /**
     * Deletes a shortcut after confirmation.
     * Shows a warning dialog and removes the shortcut if confirmed.
     */
    const deleteShortcut = async () => {
      const confirmed = await customConfirm({
        message: `Are you sure you want to delete the "${value.name}" shortcut?`,
        confirmText: "Delete",
        cancelText: "Cancel",
        confirmClass: "confirm-warning",
      });

      if (confirmed) {
        COMMANDS.delete(key);
        saveCommands();
        this.renderShortcuts();
        this.commandsComponent.render();
      }
    };

    // Add event listeners
    actionButton.addEventListener("click", function () {
      if (actionButton.classList.contains("edit-button")) {
        enableEditMode();
      } else {
        saveEditedShortcut();
      }
    });

    deleteButton.addEventListener("click", deleteShortcut);

    // Add Enter key support for saving edits
    [keyInput, nameInput, valueInput].forEach((input) => {
      input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter" && !input.readOnly) {
          e.preventDefault();
          const success = await saveEditedShortcut();
          if (!success) {
            // Focus the first empty input
            if (!keyInput.value.trim()) keyInput.focus();
            else if (!nameInput.value.trim()) nameInput.focus();
            else if (!valueInput.value.trim()) valueInput.focus();
          }
        }
      });
    });

    return shortcutItem;
  }

  /**
   * Adds a new shortcut field to the shortcut list.
   * Creates a form for adding new shortcuts with key, name, and URL inputs.
   */
  addNewShortcutField() {
    const newShortcutItem = document.createElement("div");
    newShortcutItem.classList.add("shortcut-item");

    // Create input for key
    const newKeyInput = document.createElement("input");
    newKeyInput.type = "text";
    newKeyInput.classList.add("key-input");
    newKeyInput.placeholder = "Key";
    newShortcutItem.appendChild(newKeyInput);

    // Create input for name
    const newNameInput = document.createElement("input");
    newNameInput.type = "text";
    newNameInput.classList.add("name-input");
    newNameInput.placeholder = "Name";
    newShortcutItem.appendChild(newNameInput);

    // Create input for URL
    const newValueInput = document.createElement("input");
    newValueInput.type = "text";
    newValueInput.classList.add("value-input");
    newValueInput.placeholder = "URL";
    newShortcutItem.appendChild(newValueInput);

    // Create add button
    const addButton = document.createElement("button");
    addButton.classList.add("add-button");
    addButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
    addButton.title = "Add shortcut";
    newShortcutItem.appendChild(addButton);

    /**
     * Creates a new shortcut from the input values.
     * Validates inputs and handles key conflicts with confirmation.
     * @returns {Promise<boolean>} True if creation was successful, false otherwise
     */
    const createNewShortcut = async () => {
      const newKey = newKeyInput.value.trim();
      const newName = newNameInput.value.trim();
      const newValue = newValueInput.value.trim();

      // Check all fields
      if (newKeyInput.value && newNameInput.value && newValueInput.value) {
        // If the shortcut key already exists, show the custom confirmation modal.
        if (COMMANDS.has(newKeyInput.value)) {
          const shouldOverride = await customConfirm({
            message: `The shortcut key "${newKeyInput.value}" already exists. Are you sure you want to override it?`,
            confirmText: "Override",
            cancelText: "Cancel",
            confirmClass: "confirm-override",
          });
          if (!shouldOverride) {
            return false; // Do not override if the user cancels.
          }
        }
        COMMANDS.set(newKeyInput.value, {
          name: newNameInput.value,
          url: newValueInput.value,
        });
        saveCommands();
        this.renderShortcuts();
        this.commandsComponent.render();
        return true;
      }
      return false;
    };

    // Add button click handler
    addButton.addEventListener("click", async () => {
      const success = await createNewShortcut();
      if (!success) {
        if (!newKeyInput.value) {
          newKeyInput.focus();
        } else if (!newNameInput.value) {
          newNameInput.focus();
        } else {
          newValueInput.focus();
        }
      }
    });

    // Add Enter key support for adding shortcuts
    [newKeyInput, newNameInput, newValueInput].forEach((input) => {
      input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const success = await createNewShortcut();
          if (!success) {
            if (!newKeyInput.value) {
              newKeyInput.focus();
            } else if (!newNameInput.value) {
              newNameInput.focus();
            } else {
              newValueInput.focus();
            }
          }
        }
      });
    });

    this.shortcutList.appendChild(newShortcutItem);
  }

  /**
   * Resets all settings to default values after confirmation.
   * Resets the theme and all commands to their default values.
   */
  async resetSettings() {
    const confirmed = await customConfirm({
      message:
        "Are you sure you want to reset all settings to default? This cannot be undone.",
      confirmText: "Reset",
      cancelText: "Cancel",
      confirmClass: "confirm-warning",
    });

    if (confirmed) {
      // Reset theme
      localStorage.setItem("selectedTheme", this.DEFAULT_SETTINGS.theme);
      document.documentElement.setAttribute(
        "data-theme",
        this.DEFAULT_SETTINGS.theme
      );
      document.getElementById("themeSelect").value =
        this.DEFAULT_SETTINGS.theme;

      // Reset commands
      COMMANDS.clear();
      this.DEFAULT_SETTINGS.commands.forEach((value, key) => {
        COMMANDS.set(key, value);
      });
      saveCommands();
      this.renderShortcuts();
      this.commandsComponent.render();
    }
  }

  /**
   * Checks if the modal should be scrollable based on the number of commands.
   * Adds or removes the 'scrollable' class from the modal content.
   */
  checkModalScrollability() {
    if (COMMANDS.size >= 8) {
      this.modalContent.classList.add("scrollable");
    } else {
      this.modalContent.classList.remove("scrollable");
    }
  }
}

/**
 * Displays a customizable confirmation dialog with custom text and styling.
 * @param {Object} options - Configuration options for the confirmation dialog
 * @param {string} options.message - The message to display in the dialog
 * @param {string} [options.confirmText="Yes"] - The text for the confirm button
 * @param {string} [options.cancelText="Cancel"] - The text for the cancel button
 * @param {string} [options.confirmClass=""] - CSS class to apply to the confirm button
 * @returns {Promise<boolean>} A promise that resolves to true if confirmed, false otherwise
 */
function customConfirm({
  message,
  confirmText = "Yes",
  cancelText = "Cancel",
  confirmClass = "",
}) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirmModal");
    const confirmMessage = modal.querySelector(".confirm-message");
    const okButton = modal.querySelector(".confirm-ok");
    const cancelButton = modal.querySelector(".confirm-cancel");

    confirmMessage.innerText = message;
    okButton.innerText = confirmText;
    cancelButton.innerText = cancelText;

    if (confirmClass) {
      okButton.classList.add(confirmClass);
    }

    modal.style.display = "flex";

    /**
     * Cleanup function to hide modal and remove listeners
     */
    function cleanUp() {
      okButton.removeEventListener("click", onOk);
      cancelButton.removeEventListener("click", onCancel);
      modal.style.display = "none";
      if (confirmClass) {
        okButton.classList.remove(confirmClass);
      }
    }

    /**
     * Handler for the OK button click
     */
    function onOk() {
      cleanUp();
      resolve(true);
    }

    /**
     * Handler for the Cancel button click
     */
    function onCancel() {
      cleanUp();
      resolve(false);
    }

    okButton.addEventListener("click", onOk);
    cancelButton.addEventListener("click", onCancel);
  });
}

// Initialize on document load
document.addEventListener("DOMContentLoaded", () => {
  new ModalManager();
});
