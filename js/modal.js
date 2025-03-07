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
    modal.style.display = "flex";
    modalOverlay.classList.add("active"); // Activate background overlay
    renderShortcuts(); // Refresh shortcuts when opening modal
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

      const keyInput = document.createElement("input");
      keyInput.type = "text";
      keyInput.value = key;
      keyInput.classList.add("key-input");

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = value.name || "";
      nameInput.classList.add("name-input");

      const valueInput = document.createElement("input");
      valueInput.type = "text";
      valueInput.value = value.url || "";
      valueInput.classList.add("value-input");

      shortcutItem.appendChild(keyInput);
      shortcutItem.appendChild(nameInput);
      shortcutItem.appendChild(valueInput);

      shortcutList.appendChild(shortcutItem);
    });

    addNewShortcutField();
    checkModalScrollability();
  }

  // Add a field for adding a new shortcut
  function addNewShortcutField() {
    const newShortcutItem = document.createElement("div");
    newShortcutItem.classList.add("shortcut-item");

    const newKeyInput = document.createElement("input");
    newKeyInput.type = "text";
    newKeyInput.placeholder = "Key";
    newKeyInput.classList.add("key-input");

    const newNameInput = document.createElement("input");
    newNameInput.type = "text";
    newNameInput.placeholder = "Name";
    newNameInput.classList.add("name-input");

    const newValueInput = document.createElement("input");
    newValueInput.type = "text";
    newValueInput.placeholder = "Value";
    newValueInput.classList.add("value-input");

    const addButton = document.createElement("button");
    addButton.classList.add("add-button");
    addButton.innerHTML = '<i class="fa-solid fa-plus"></i>';

    addButton.addEventListener("click", async () => {
      if (newKeyInput.value && newNameInput.value && newValueInput.value) {
        // If the shortcut key already exists, show the custom confirmation modal.
        if (COMMANDS.has(newKeyInput.value)) {
          const confirmed = await customConfirm({
            message: `The shortcut key "${newKeyInput.value}" already exists. Are you sure you want to override it?`,
            confirmText: "Override",
            cancelText: "Cancel",
          });
          if (!confirmed) {
            return; // Do not override if the user cancels.
          }
        }
        COMMANDS.set(newKeyInput.value, {
          name: newNameInput.value,
          url: newValueInput.value,
        });
        saveCommands();
        renderShortcuts();
        commandsComponent.render(); // Re-render the commands component
      }
    });

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
