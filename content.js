(() => {
  if (window.__privateTextExpanderV23) return;
  window.__privateTextExpanderV23 = true;

  const DEFAULT_PREFIX = ":";

  let shortcuts = [];
  let triggerPrefix = DEFAULT_PREFIX;

  function normalizePrefix(value) {
    const prefix = String(value || "").trim();
    return prefix && !/\s/.test(prefix) ? prefix : DEFAULT_PREFIX;
  }

  function normalizeShortcut(item) {
    if (!item || typeof item !== "object") return null;

    const trigger = String(item.trigger || "");
    const text = String(item.text ?? item.replacement ?? "");

    if (!trigger || !text) return null;

    return { trigger, text };
  }

  async function loadSettings() {
    const data = await chrome.storage.local.get([
      "shortcuts",
      "triggerPrefix"
    ]);

    triggerPrefix = normalizePrefix(data.triggerPrefix);
    shortcuts = Array.isArray(data.shortcuts)
      ? data.shortcuts.map(normalizeShortcut).filter(Boolean)
      : [];
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;

    if (changes.triggerPrefix) {
      triggerPrefix = normalizePrefix(changes.triggerPrefix.newValue);
    }

    if (changes.shortcuts) {
      shortcuts = Array.isArray(changes.shortcuts.newValue)
        ? changes.shortcuts.newValue.map(normalizeShortcut).filter(Boolean)
        : [];
    }
  });

  function isEditable(element) {
    if (!element) return false;

    if (element instanceof HTMLTextAreaElement) {
      return !element.disabled && !element.readOnly;
    }

    if (element instanceof HTMLInputElement) {
      const allowedTypes = [
        "text",
        "search",
        "email",
        "url",
        "tel",
        "password"
      ];

      return (
        allowedTypes.includes(element.type) &&
        !element.disabled &&
        !element.readOnly
      );
    }

    return element.isContentEditable;
  }

  function getCaretText(element) {
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      const caret = element.selectionStart;
      if (caret == null) return null;

      return {
        text: element.value.slice(0, caret),
        start: caret
      };
    }

    const selection = window.getSelection();

    if (
      !selection ||
      selection.rangeCount === 0 ||
      !selection.isCollapsed
    ) {
      return null;
    }

    const range = selection.getRangeAt(0);
    const node = range.startContainer;

    if (node.nodeType !== Node.TEXT_NODE) return null;

    const text = node.textContent.slice(0, range.startOffset);

    return {
      text,
      start: range.startOffset,
      node
    };
  }

  function findMatch(text) {
    if (!triggerPrefix || !text) return null;

    const escapedPrefix = triggerPrefix.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    // Kısayol, önekle başlamalı ve boşluk içermemelidir.
    const regex = new RegExp(
      `(^|\\s)(${escapedPrefix}[^\\s]+)$`
    );

    const match = text.match(regex);
    if (!match) return null;

    const trigger = match[2];
    const shortcut = shortcuts.find(
      (item) => item.trigger === trigger
    );

    if (!shortcut) return null;

    return {
      trigger,
      shortcut,
      start: match.index + match[1].length
    };
  }

  function replaceInInput(element, match) {
    const caret = element.selectionStart;
    if (caret == null) return false;

    const value = element.value;
    const start = caret - match.trigger.length;

    if (start < 0) return false;

    const before = value.slice(0, start);
    const after = value.slice(caret);
    const newValue = before + match.shortcut.text + after;
    const newCaret = before.length + match.shortcut.text.length;

    const setter = Object.getOwnPropertyDescriptor(
      element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype,
      "value"
    )?.set;

    if (setter) {
      setter.call(element, newValue);
    } else {
      element.value = newValue;
    }

    element.setSelectionRange(newCaret, newCaret);
    element.dispatchEvent(new Event("input", { bubbles: true }));

    return true;
  }

  function replaceInContentEditable(element, match, caretData) {
    const selection = window.getSelection();
    if (!selection || !caretData?.node) return false;

    const node = caretData.node;
    const caretOffset = caretData.start;
    const start = caretOffset - match.trigger.length;

    if (start < 0) return false;

    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, caretOffset);
    range.deleteContents();

    const replacement = document.createTextNode(match.shortcut.text);
    range.insertNode(replacement);

    range.setStartAfter(replacement);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);

    element.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: match.shortcut.text
    }));

    return true;
  }

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.isComposing) return;
    if (event.key !== " " && event.key !== "Enter" && event.key !== "Tab") {
      return;
    }

    const element = event.target;
    if (!isEditable(element)) return;

    const caretData = getCaretText(element);
    if (!caretData) return;

    const match = findMatch(caretData.text);
    if (!match) return;

    // Genişletme öncesinde tarayıcının boşluk/enter eklemesini bekle.
    event.preventDefault();

    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      const caret = element.selectionStart;
      const value = element.value;
      const start = caret - match.trigger.length;

      if (start < 0) return;

      const before = value.slice(0, start);
      const after = value.slice(caret);
      const suffix = event.key === " " ? " " : event.key === "Enter" ? "\n" : "\t";
      const replacement = match.shortcut.text + suffix;
      const newValue = before + replacement + after;
      const newCaret = before.length + replacement.length;

      const prototype = element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;

      const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
      if (setter) setter.call(element, newValue);
      else element.value = newValue;

      element.setSelectionRange(newCaret, newCaret);
      element.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const node = caretData.node;
    const caretOffset = caretData.start;
    if (!node) return;

    const start = caretOffset - match.trigger.length;
    if (start < 0) return;

    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, caretOffset);
    range.deleteContents();

    const suffix = event.key === " " ? " " : event.key === "Enter" ? "\n" : "\t";
    const replacement = document.createTextNode(match.shortcut.text + suffix);
    range.insertNode(replacement);

    range.setStartAfter(replacement);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    element.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: match.shortcut.text + suffix
    }));
  }, true);

  loadSettings().catch(() => {
    shortcuts = [];
    triggerPrefix = DEFAULT_PREFIX;
  });
})();