class Commands extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
    // Re-render on resize so column count updates
    window.addEventListener("resize", () => this.render());
  }

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

  // Determine the number of columns based on screen width.
  getColumns() {
    if (window.innerWidth >= 900) return 4;
    if (window.innerWidth >= 500) return 2;
    return 1;
  }

  // Check if the last row is partially filled.
  shouldAddButton(count, columns) {
    const lastRowItems = count % columns;
    return lastRowItems !== 0; // Only add button if there's space in the last row.
  }

  // Append the dynamic button and set its height to fill the empty cells.
  addDynamicButton(commands, count, columns) {
    const CELL_HEIGHT = 60; // Base height per cell (adjust as needed)
    const lastRowItems = count % columns;
    const remainingCells = columns - lastRowItems;

    const button = document.createElement("button");
    button.classList.add("dynamic-button");
    button.innerHTML = "+";
    button.addEventListener("click", () => {
      // Open the modal to add a new shortcut
      document.getElementById("openModal").click();
    });
    // Extend the button to fill all empty cells in the row.
    button.style.height = `${remainingCells * CELL_HEIGHT}px`;
    button.style.width = "99%";

    commands.append(button);
  }
}

// Register the custom element when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  customElements.define("commands-component", Commands);
}); 