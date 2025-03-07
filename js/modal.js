// Modal functionality
document.addEventListener("DOMContentLoaded", () => {
  const openModalBtn = document.getElementById("openModal");
  const closeModalBtn = document.getElementById("closeModal");
  const modal = document.getElementById("settingsModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const shortcutList = document.getElementById("shortcutList");
  const modalContent = document.querySelector(".modal-content");
  const commandsComponent = document.querySelector("commands-component");
  const resetButton = document.getElementById("resetSettings");

  // Track if we should focus on new shortcut inputs
  let shouldFocusNewShortcut = false;

  // Listen for the custom event
  document.addEventListener("focusNewShortcut", () => {
    shouldFocusNewShortcut = true;
  });

  // Default settings
  const DEFAULT_SETTINGS = {
    theme: "dark",
    commands: new Map([
      ["g", { name: "Gmail", url: "https://mail.google.com/mail/u/0/#inbox" }],
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

  // Reset settings function
  async function resetSettings() {
    const confirmed = await customConfirm({
      message:
        "Are you sure you want to reset all settings to default? This cannot be undone.",
      confirmText: "Reset",
      cancelText: "Cancel",
      confirmClass: "confirm-warning",
    });

    if (confirmed) {
      // Reset theme
      localStorage.setItem("selectedTheme", DEFAULT_SETTINGS.theme);
      document.documentElement.setAttribute(
        "data-theme",
        DEFAULT_SETTINGS.theme
      );
      document.getElementById("themeSelect").value = DEFAULT_SETTINGS.theme;

      // Reset commands
      COMMANDS.clear();
      DEFAULT_SETTINGS.commands.forEach((value, key) => {
        COMMANDS.set(key, value);
      });
      saveCommands();
      renderShortcuts();
      commandsComponent.render();
    }
  }

  // Reset button click handler
  resetButton.addEventListener("click", resetSettings);

  // Open Modal
  openModalBtn.addEventListener("click", () => {
    // Close search dialog if it's open
    const searchComponent = document.querySelector("search-component");
    if (searchComponent) {
      const dialog = searchComponent.shadowRoot.querySelector(".dialog");
      if (dialog && dialog.open) {
        dialog.close();
      }
    }

    modal.style.display = "flex";
    modalOverlay.classList.add("active"); // Activate background overlay
    renderShortcuts(); // Refresh shortcuts when opening modal

    // Focus based on context
    setTimeout(() => {
      if (shouldFocusNewShortcut) {
        // Focus the first input of the new shortcut section
        const lastShortcutItem = shortcutList.lastElementChild;
        if (lastShortcutItem) {
          const firstInput = lastShortcutItem.querySelector(".key-input");
          if (firstInput) {
            firstInput.focus();
          }
        }
        shouldFocusNewShortcut = false; // Reset the flag
      } else {
        // Default focus on theme dropdown
        const themeSelect = document.getElementById("themeSelect");
        if (themeSelect) {
          themeSelect.focus();
        }
      }
    }, 100); // A short delay to ensure the modal is fully rendered
  });

  // Close Modal (clicking the X)
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
    modalOverlay.classList.remove("active"); // Deactivate background overlay
  });

  // Close Modal (clicking outside the modal content)
  window.addEventListener("click", (event) => {
    if (event.target === modal || event.target === modalOverlay) {
      modal.style.display = "none";
      modalOverlay.classList.remove("active"); // Deactivate background overlay
    }
  });

  // Render the list of shortcuts in the modal
  function renderShortcuts() {
    shortcutList.innerHTML = "";
    COMMANDS.forEach((value, key) => {
      const shortcutItem = document.createElement("div");
      shortcutItem.classList.add("shortcut-item");
      shortcutItem.dataset.key = key; // Store original key for reference

      const keyInput = document.createElement("input");
      keyInput.type = "text";
      keyInput.value = key;
      keyInput.classList.add("key-input");
      keyInput.readOnly = true; // Initially not editable
      keyInput.addEventListener("mousedown", focusInput);

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = value.name || "";
      nameInput.classList.add("name-input");
      nameInput.readOnly = true; // Initially not editable
      nameInput.addEventListener("mousedown", focusInput);

      const valueInput = document.createElement("input");
      valueInput.type = "text";
      valueInput.value = value.url || "";
      valueInput.classList.add("value-input");
      valueInput.readOnly = true; // Initially not editable
      valueInput.addEventListener("mousedown", focusInput);

      // Create action button (initially edit button)
      const actionButton = document.createElement("button");
      actionButton.classList.add("edit-button");
      actionButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
      actionButton.title = "Edit shortcut";
      actionButton.addEventListener("mousedown", (e) => e.stopPropagation());

      // Create delete button
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-button");
      deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
      deleteButton.title = "Delete shortcut";
      deleteButton.addEventListener("mousedown", (e) => e.stopPropagation());

      // Function to enable edit mode
      function enableEditMode() {
        // Store original values for cancel functionality
        shortcutItem.dataset.originalKey = keyInput.value;
        shortcutItem.dataset.originalName = nameInput.value;
        shortcutItem.dataset.originalUrl = valueInput.value;

        // Make inputs editable
        keyInput.readOnly = false;
        nameInput.readOnly = false;
        valueInput.readOnly = false;

        // Change action button to save button
        actionButton.classList.remove("edit-button");
        actionButton.classList.add("save-button");
        actionButton.innerHTML = '<i class="fa-solid fa-check"></i>';
        actionButton.title = "Save changes";

        // Focus the name input
        nameInput.focus();
      }

      // Function to save edited shortcut
      async function saveEditedShortcut() {
        const newKey = keyInput.value.trim();
        const newName = nameInput.value.trim();
        const newUrl = valueInput.value.trim();
        const originalKey = shortcutItem.dataset.key;

        // Validate inputs
        if (!newKey || !newName || !newUrl) {
          return false;
        }

        // If key changed and new key already exists (and is not the original key)
        if (newKey !== originalKey && COMMANDS.has(newKey)) {
          const confirmed = await customConfirm({
            message: `The shortcut key "${newKey}" already exists. Are you sure you want to override it?`,
            confirmText: "Override",
            cancelText: "Cancel",
          });

          if (!confirmed) {
            return false;
          }
        }

        // Remove original shortcut if key changed
        if (newKey !== originalKey) {
          COMMANDS.delete(originalKey);
        }

        // Set the new shortcut
        COMMANDS.set(newKey, {
          name: newName,
          url: newUrl,
        });

        // Save and re-render
        saveCommands();
        renderShortcuts();
        commandsComponent.render();
        return true;
      }

      // Function to cancel edit mode
      function cancelEditMode() {
        // Restore original values
        keyInput.value = shortcutItem.dataset.originalKey;
        nameInput.value = shortcutItem.dataset.originalName;
        valueInput.value = shortcutItem.dataset.originalUrl;

        // Make inputs read-only again
        keyInput.readOnly = true;
        nameInput.readOnly = true;
        valueInput.readOnly = true;

        // Change save button back to edit button
        actionButton.classList.remove("save-button");
        actionButton.classList.add("edit-button");
        actionButton.innerHTML = '<i class="fa-solid fa-pen"></i>';
        actionButton.title = "Edit shortcut";
      }

      // Function to delete shortcut
      async function deleteShortcut() {
        const confirmed = await customConfirm({
          message: `Are you sure you want to delete the "${value.name}" shortcut?`,
          confirmText: "Delete",
          cancelText: "Cancel",
          confirmClass: "confirm-warning",
        });

        if (confirmed) {
          COMMANDS.delete(key);
          saveCommands();
          renderShortcuts();
          commandsComponent.render();
        }
      }

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
          } else if (e.key === "Escape" && !input.readOnly) {
            e.preventDefault();
            cancelEditMode();
          }
        });
      });

      shortcutItem.appendChild(keyInput);
      shortcutItem.appendChild(nameInput);
      shortcutItem.appendChild(valueInput);
      shortcutItem.appendChild(actionButton);
      shortcutItem.appendChild(deleteButton);

      shortcutList.appendChild(shortcutItem);
    });

    addNewShortcutField();
    checkModalScrollability();
  }

  // Focus helper for input fields
  function focusInput(e) {
    e.stopPropagation();
    setTimeout(() => {
      e.target.focus();
    }, 0);
  }

  // Add a field for adding a new shortcut
  function addNewShortcutField() {
    const newShortcutItem = document.createElement("div");
    newShortcutItem.classList.add("shortcut-item");

    const newKeyInput = document.createElement("input");
    newKeyInput.type = "text";
    newKeyInput.placeholder = "Key";
    newKeyInput.classList.add("key-input");
    newKeyInput.addEventListener("mousedown", focusInput);

    const newNameInput = document.createElement("input");
    newNameInput.type = "text";
    newNameInput.placeholder = "Name";
    newNameInput.classList.add("name-input");
    newNameInput.addEventListener("mousedown", focusInput);

    const newValueInput = document.createElement("input");
    newValueInput.type = "text";
    newValueInput.placeholder = "Value";
    newValueInput.classList.add("value-input");
    newValueInput.addEventListener("mousedown", focusInput);

    const addButton = document.createElement("button");
    addButton.classList.add("add-button");
    addButton.innerHTML = '<i class="fa-solid fa-plus"></i>';
    addButton.addEventListener("mousedown", (e) => e.stopPropagation());

    // Function to handle shortcut creation
    async function createNewShortcut() {
      if (newKeyInput.value && newNameInput.value && newValueInput.value) {
        // If the shortcut key already exists, show the custom confirmation modal.
        if (COMMANDS.has(newKeyInput.value)) {
          const confirmed = await customConfirm({
            message: `The shortcut key "${newKeyInput.value}" already exists. Are you sure you want to override it?`,
            confirmText: "Override",
            cancelText: "Cancel",
          });
          if (!confirmed) {
            return false; // Do not override if the user cancels.
          }
        }
        COMMANDS.set(newKeyInput.value, {
          name: newNameInput.value,
          url: newValueInput.value,
        });
        saveCommands();
        renderShortcuts();
        commandsComponent.render(); // Re-render the commands component
        return true;
      }
      return false;
    }

    // Add Enter key handler to all new shortcut inputs
    [newKeyInput, newNameInput, newValueInput].forEach((input) => {
      input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const success = await createNewShortcut();
          if (!success) {
            // If creation failed, focus the first empty input
            if (!newKeyInput.value) newKeyInput.focus();
            else if (!newNameInput.value) newNameInput.focus();
            else if (!newValueInput.value) newValueInput.focus();
          }
        }
      });
    });

    // Add button click handler
    addButton.addEventListener("click", createNewShortcut);

    newShortcutItem.appendChild(newKeyInput);
    newShortcutItem.appendChild(newNameInput);
    newShortcutItem.appendChild(newValueInput);
    newShortcutItem.appendChild(addButton);

    shortcutList.appendChild(newShortcutItem);
  }

  // Add scrolling to modal if many shortcuts
  function checkModalScrollability() {
    if (COMMANDS.size >= 15) {
      modalContent.classList.add("scrollable");
    } else {
      modalContent.classList.remove("scrollable");
    }
  }

  // Initialize by loading commands
  loadCommands();
  renderShortcuts();
  commandsComponent.render();
});

// Enhanced custom confirmation modal
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

    // Cleanup function to hide modal and remove listeners
    function cleanUp() {
      okButton.removeEventListener("click", onOk);
      cancelButton.removeEventListener("click", onCancel);
      modal.style.display = "none";
      if (confirmClass) {
        okButton.classList.remove(confirmClass);
      }
    }

    function onOk() {
      cleanUp();
      resolve(true);
    }
    function onCancel() {
      cleanUp();
      resolve(false);
    }

    okButton.addEventListener("click", onOk);
    cancelButton.addEventListener("click", onCancel);
  });
}
