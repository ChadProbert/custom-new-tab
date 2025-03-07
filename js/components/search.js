class Search extends HTMLElement {
  #dialog;
  #form;
  #input;
  #suggestions;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const template = document.getElementById("search-template");
    const clone = template.content.cloneNode(true);
    this.#dialog = clone.querySelector(".dialog");
    this.#form = clone.querySelector(".form");
    this.#input = clone.querySelector(".input");
    this.#suggestions = clone.querySelector(".suggestions");
    this.#form.addEventListener("submit", this.#onSubmit, false);
    this.#input.addEventListener("input", this.#onInput);
    this.#suggestions.addEventListener("click", this.#onSuggestionClick);
    document.addEventListener("keydown", this.#onKeydown);
    this.shadowRoot.append(clone);
  }

  static #attachSearchPrefix(array, { key, splitBy }) {
    if (!splitBy) return array;
    return array.map((search) => `${key}${splitBy}${search}`);
  }

  static #escapeRegexCharacters(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  }

  static #fetchDuckDuckGoSuggestions(search) {
    return new Promise((resolve) => {
      window.autocompleteCallback = (res) => {
        const suggestions = [];

        for (const item of res) {
          if (item.phrase === search.toLowerCase()) continue;
          suggestions.push(item.phrase);
        }

        resolve(suggestions);
      };

      const script = document.createElement("script");
      document.querySelector("head").appendChild(script);
      script.src = `https://duckduckgo.com/ac/?callback=autocompleteCallback&q=${search}`;
      script.onload = script.remove;
    });
  }

  static #formatSearchUrl(url, searchPath, search) {
    if (!searchPath) return url;
    const [baseUrl] = Search.#splitUrl(url);
    const urlQuery = encodeURIComponent(search);
    searchPath = searchPath.replace(/{}/g, urlQuery);
    return baseUrl + searchPath;
  }

  static #hasProtocol(s) {
    return /^[a-zA-Z]+:\/\//i.test(s);
  }

  static #isUrl(s) {
    return /^((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)$/i.test(
      s
    );
  }

  static #parseQuery = (raw) => {
    const query = raw.trim();

    if (this.#isUrl(query)) {
      const url = this.#hasProtocol(query) ? query : `https://${query}`;
      return { query, url };
    }

    if (COMMANDS.has(query)) {
      const { command, key, url } = COMMANDS.get(query);
      return command ? Search.#parseQuery(command) : { key, query, url };
    }

    let splitBy = CONFIG.commandSearchDelimiter;
    const [searchKey, rawSearch] = query.split(
      new RegExp(`${splitBy}(.*)`)
    );

    if (COMMANDS.has(searchKey)) {
      const { searchTemplate, url: base } = COMMANDS.get(searchKey);
      const search = rawSearch.trim();
      const url = Search.#formatSearchUrl(base, searchTemplate, search);
      return { key: searchKey, query, search, splitBy, url };
    }

    splitBy = CONFIG.commandPathDelimiter;
    const [pathKey, path] = query.split(new RegExp(`${splitBy}(.*)`));

    if (COMMANDS.has(pathKey)) {
      const { url: base } = COMMANDS.get(pathKey);
      const [baseUrl] = Search.#splitUrl(base);
      const url = `${baseUrl}/${path}`;
      return { key: pathKey, path, query, splitBy, url };
    }

    const [baseUrl, rest] = Search.#splitUrl(
      CONFIG.defaultSearchTemplate
    );
    const url = Search.#formatSearchUrl(baseUrl, rest, query);
    return { query, search: query, url };
  };

  static #splitUrl(url) {
    const parser = document.createElement("a");
    parser.href = url;
    const baseUrl = `${parser.protocol}//${parser.hostname}`;
    const rest = `${parser.pathname}${parser.search}`;
    return [baseUrl, rest];
  }

  #close() {
    this.#input.value = "";
    this.#input.blur();
    this.#dialog.close();
    this.#suggestions.innerHTML = "";
  }

  #execute(query) {
    const { url } = Search.#parseQuery(query);
    const target = CONFIG.openLinksInNewTab ? "_blank" : "_self";
    window.open(url, target, "noopener noreferrer");
    this.#close();
  }

  #focusNextSuggestion(previous = false) {
    const active = this.shadowRoot.activeElement;
    let nextIndex;

    if (active.dataset.index) {
      const activeIndex = Number(active.dataset.index);
      nextIndex = previous ? activeIndex - 1 : activeIndex + 1;
    } else {
      nextIndex = previous ? this.#suggestions.childElementCount - 1 : 0;
    }

    const next = this.#suggestions.children[nextIndex];
    if (next) next.querySelector(".suggestion").focus();
    else this.#input.focus();
  }

  #onInput = async () => {
    const oq = Search.#parseQuery(this.#input.value);

    if (!oq.query) {
      this.#close();
      return;
    }

    let suggestions = COMMANDS.get(oq.query)?.suggestions ?? [];

    if (oq.search && suggestions.length < CONFIG.suggestionLimit) {
      const res = await Search.#fetchDuckDuckGoSuggestions(oq.search);
      const formatted = Search.#attachSearchPrefix(res, oq);
      suggestions = suggestions.concat(formatted);
    }

    const nq = Search.#parseQuery(this.#input.value);
    if (nq.query !== oq.query) return;
    this.#renderSuggestions(suggestions, oq.query);
  };

  #onKeydown = (e) => {
    if (!this.#dialog.open) {
      this.#dialog.show();
      this.#input.focus();

      requestAnimationFrame(() => {
        // Close the search dialog before the next repaint if a character is
        // not produced (e.g. if you type shift, control, alt etc.)
        if (!this.#input.value) this.#close();
      });

      return;
    }

    if (e.key === "Escape") {
      this.#close();
      return;
    }

    const alt = e.altKey ? "alt-" : "";
    const ctrl = e.ctrlKey ? "ctrl-" : "";
    const meta = e.metaKey ? "meta-" : "";
    const shift = e.shiftKey ? "shift-" : "";
    const modifierPrefixedKey = `${alt}${ctrl}${meta}${shift}${e.key}`;

    if (/^(ArrowDown|Tab|ctrl-n)$/.test(modifierPrefixedKey)) {
      e.preventDefault();
      this.#focusNextSuggestion();
      return;
    }

    if (/^(ArrowUp|ctrl-p|shift-Tab)$/.test(modifierPrefixedKey)) {
      e.preventDefault();
      this.#focusNextSuggestion(true);
    }
  };

  #onSubmit = () => {
    this.#execute(this.#input.value);
  };

  #onSuggestionClick = (e) => {
    const ref = e.target.closest(".suggestion");
    if (!ref) return;
    this.#execute(ref.dataset.suggestion);
  };

  #renderSuggestions(suggestions, query) {
    this.#suggestions.innerHTML = "";
    const sliced = suggestions.slice(0, CONFIG.suggestionLimit);
    const template = document.getElementById("suggestion-template");

    for (const [index, suggestion] of sliced.entries()) {
      const clone = template.content.cloneNode(true);
      const ref = clone.querySelector(".suggestion");
      ref.dataset.index = index;
      ref.dataset.suggestion = suggestion;
      const escapedQuery = Search.#escapeRegexCharacters(query);
      const matched = suggestion.match(new RegExp(escapedQuery, "i"));

      if (matched) {
        const template = document.getElementById("match-template");
        const clone = template.content.cloneNode(true);
        const matchRef = clone.querySelector(".match");
        const pre = suggestion.slice(0, matched.index);
        const post = suggestion.slice(matched.index + matched[0].length);
        matchRef.innerText = matched[0];
        matchRef.insertAdjacentHTML("beforebegin", pre);
        matchRef.insertAdjacentHTML("afterend", post);
        ref.append(clone);
      } else {
        ref.innerText = suggestion;
      }

      this.#suggestions.append(clone);
    }
  }
}

// Register the custom element when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  customElements.define("search-component", Search);
}); 