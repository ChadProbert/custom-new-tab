/**
 * Commands component for displaying and managing keyboard shortcuts.
 * Handles the rendering and layout of command shortcuts in a responsive grid.
 */
class Commands extends HTMLElement {
  /**
   * Initializes the Commands component and sets up event listeners.
   * Creates a shadow DOM and renders the initial commands layout.
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
    // Re-render on resize so column count updates
    window.addEventListener("resize", () => this.render());
  }

  /**
   * Renders the commands grid with all shortcuts.
   * Creates a column layout based on screen width and populates with command shortcuts.
   * Also adds a dynamic "+" button when appropriate.
   */
  render() {
    this.shadowRoot.innerHTML = "";
    const template = document.getElementById("commands-template");
    const clone = template.content.cloneNode(true);
    const commands = clone.querySelector(".commands");
    const commandTemplate = document.getElementById("command-template");

    let count = 0;
    const columns = this.getColumns();

    // Render each shortcut
    for (const [key, { name, url }] of COMMANDS.entries()) {
      if (!name || !url) continue;
      const commandClone = commandTemplate.content.cloneNode(true);
      const command = commandClone.querySelector(".command");
      command.href = url;
      if (CONFIG.openLinksInNewTab) command.target = "_blank";
      commandClone.querySelector(".key").innerText = key;
      commandClone.querySelector(".name").innerText = name;
      commands.append(commandClone);
      count++;
    }

    // Add the dynamic button if the last row isn't completely full.
    if (this.shouldAddButton(count, columns)) {
      this.addDynamicButton(commands, count, columns);
    }

    this.shadowRoot.append(clone);
  }

  /**
   * Determines the number of columns based on screen width.
   * @returns {number} The number of columns to display (1, 2, or 4)
   */
  getColumns() {
    if (window.innerWidth >= 900) return 4;
    if (window.innerWidth >= 500) return 2;
    return 1;
  }

  /**
   * Checks if the dynamic "+" button should be added.
   * Only adds the button if the last row has space.
   * @param {number} count - The number of commands
   * @param {number} columns - The number of columns
   * @returns {boolean} True if the button should be added
   */
  shouldAddButton(count, columns) {
    const lastRowItems = count % columns;
    return lastRowItems !== 0; // Only add button if there's space in the last row.
  }

  /**
   * Appends the dynamic "+" button to the commands grid.
   * Sizes the button to fill the remaining space in the last row.
   * @param {HTMLElement} commands - The commands container element
   * @param {number} count - The number of commands
   * @param {number} columns - The number of columns
   */
  addDynamicButton(commands, count, columns) {
    const CELL_HEIGHT = 60; // Base height per cell (adjust as needed)
    const lastRowItems = count % columns;
    const remainingCells = columns - lastRowItems;

    const button = document.createElement("button");
    button.classList.add("dynamic-button");
    button.innerHTML = "+";
    button.addEventListener("click", () => {
      // Open the modal to add a new shortcut
      const openModalBtn = document.getElementById("openModal");
      openModalBtn.click();
      // Dispatch a custom event to indicate we want to focus on the new shortcut inputs
      document.dispatchEvent(new CustomEvent("focusNewShortcut"));
    });
    // Extend the button to fill all empty cells in the row.
    button.style.height = `${remainingCells * CELL_HEIGHT}px`;
    button.style.width = "99%";

    commands.append(button);
  }
}

// Register the custom element when the document is loaded
document.addEventListener("DOMContentLoaded", () => {
  customElements.define("commands-component", Commands);
});
