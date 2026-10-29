const DEFAULT_PREFIX = ":";

const $ = (id) => document.getElementById(id);

let shortcuts = [];
let editingIndex = -1;
let triggerPrefix = DEFAULT_PREFIX;

function normalizePrefix(value) {
  return String(value || "").trim();
}

function isValidPrefix(prefix) {
  return prefix.length > 0 && !/\s/.test(prefix);
}

function normalizeTrigger(value, prefix = triggerPrefix) {
  const input = String(value || "").trim();

  if (!input || !prefix) return "";

  // Kullanıcı öneki yazmışsa tekrarlama.
  const withoutPrefix = input.startsWith(prefix)
    ? input.slice(prefix.length)
    : input;

  const suffix = withoutPrefix.trim();

  if (!suffix || /\s/.test(suffix)) return "";

  return prefix + suffix;
}

function setStatus(id, message) {
  $(id).textContent = message;
}

async function loadData() {
  const data = await chrome.storage.local.get([
    "shortcuts",
    "theme",
    "triggerPrefix"
  ]);

  triggerPrefix = normalizePrefix(data.triggerPrefix) || DEFAULT_PREFIX;

  shortcuts = Array.isArray(data.shortcuts)
    ? data.shortcuts.map((item) => {
        if (typeof item === "string") {
          return {
            trigger: "",
            text: item
          };
        }

        return {
          trigger: String(item?.trigger || ""),
          text: String(item?.text ?? item?.replacement ?? "")
        };
      }).filter((item) => item.trigger && item.text)
    : [];

  // Eski sürümlerde saklanan tetikleyicileri yeni önekle uyumlu hale getir.
  shortcuts = shortcuts.map((item) => ({
    ...item,
    trigger: normalizeTrigger(item.trigger, triggerPrefix)
  })).filter((item) => item.trigger);

  $("triggerPrefix").value = triggerPrefix;
  $("theme").value = data.theme === "light" ? "light" : "dark";

  applyTheme($("theme").value);
  renderShortcuts();
}

async function saveShortcuts() {
  await chrome.storage.local.set({ shortcuts });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme =
    theme === "light" ? "light" : "dark";
}

function renderShortcuts() {
  const list = $("shortcutList");
  list.replaceChildren();

  if (shortcuts.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Henüz kısayol eklemediniz.";
    list.appendChild(empty);
    return;
  }

  shortcuts.forEach((shortcut, index) => {
    const item = document.createElement("div");
    item.className = "shortcut-item";

    const info = document.createElement("div");
    info.className = "shortcut-info";

    const trigger = document.createElement("span");
    trigger.className = "shortcut-trigger";
    trigger.textContent = shortcut.trigger;

    const preview = document.createElement("span");
    preview.className = "shortcut-preview";
    preview.textContent = shortcut.text;

    info.append(trigger, preview);

    const actions = document.createElement("div");
    actions.className = "item-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Düzenle";
    editButton.addEventListener("click", () => editShortcut(index));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger";
    deleteButton.textContent = "Sil";
    deleteButton.addEventListener("click", () => deleteShortcut(index));

    actions.append(editButton, deleteButton);
    item.append(info, actions);
    list.appendChild(item);
  });
}

function resetForm() {
  editingIndex = -1;
  $("shortcutForm").reset();
  $("trigger").readOnly = false;
  $("formTitle").textContent = "Yeni kısayol";
  $("saveShortcut").textContent = "Kaydet";
  $("cancelEdit").hidden = true;
  setStatus("shortcutStatus", "");
}

function editShortcut(index) {
  const shortcut = shortcuts[index];
  if (!shortcut) return;

  editingIndex = index;
  $("trigger").value = shortcut.trigger;
  $("trigger").readOnly = false;
  $("replacement").value = shortcut.text;
  $("formTitle").textContent = "Kısayolu düzenle";
  $("saveShortcut").textContent = "Değişiklikleri kaydet";
  $("cancelEdit").hidden = false;
  setStatus("shortcutStatus", "");
  $("trigger").focus();
}

async function deleteShortcut(index) {
  if (!confirm("Bu kısayolu silmek istiyor musunuz?")) return;

  shortcuts.splice(index, 1);
  await saveShortcuts();
  renderShortcuts();

  if (editingIndex === index) resetForm();

  setStatus("shortcutStatus", "Kısayol silindi.");
}

$("shortcutForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const trigger = normalizeTrigger($("trigger").value);
  const text = $("replacement").value;

  if (!trigger) {
    setStatus(
      "shortcutStatus",
      `Geçerli bir tetikleyici girin. Örnek: ${triggerPrefix}mail`
    );
    return;
  }

  if (!text.trim()) {
    setStatus("shortcutStatus", "Genişletilecek metin boş olamaz.");
    return;
  }

  const duplicateIndex = shortcuts.findIndex(
    (item, index) => item.trigger === trigger && index !== editingIndex
  );

  if (duplicateIndex !== -1) {
    setStatus("shortcutStatus", "Bu tetikleyici zaten kullanılıyor.");
    return;
  }

  const shortcut = { trigger, text };

  if (editingIndex >= 0) {
    shortcuts[editingIndex] = shortcut;
  } else {
    shortcuts.push(shortcut);
  }

  await saveShortcuts();
  renderShortcuts();
  resetForm();

  setStatus("shortcutStatus", "Kısayol kaydedildi.");
});

$("cancelEdit").addEventListener("click", resetForm);

$("saveTriggerPrefix").addEventListener("click", async () => {
  const newPrefix = normalizePrefix($("triggerPrefix").value);

  if (!isValidPrefix(newPrefix)) {
    setStatus(
      "settingsStatus",
      "Önek boş olamaz ve boşluk içeremez."
    );
    return;
  }

  const oldPrefix = triggerPrefix;

  if (newPrefix !== oldPrefix) {
    triggerPrefix = newPrefix;

    shortcuts = shortcuts.map((shortcut) => {
      let suffix = shortcut.trigger;

      if (suffix.startsWith(oldPrefix)) {
        suffix = suffix.slice(oldPrefix.length);
      }

      return {
        ...shortcut,
        trigger: normalizeTrigger(suffix, newPrefix)
      };
    }).filter((item) => item.trigger);

    // Yeni önekle çakışan kısayolları tekilleştir.
    const seen = new Set();
    shortcuts = shortcuts.filter((item) => {
      if (seen.has(item.trigger)) return false;
      seen.add(item.trigger);
      return true;
    });

    await chrome.storage.local.set({
      triggerPrefix,
      shortcuts
    });

    renderShortcuts();
  } else {
    await chrome.storage.local.set({ triggerPrefix });
  }

  $("triggerPrefix").value = triggerPrefix;
  setStatus("settingsStatus", "Tetikleyici öneki kaydedildi.");
});

$("theme").addEventListener("change", async () => {
  const theme = $("theme").value === "light" ? "light" : "dark";
  applyTheme(theme);
  await chrome.storage.local.set({ theme });
});

$("exportData").addEventListener("click", () => {
  const backup = {
    version: 1,
    triggerPrefix,
    shortcuts
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "private-text-expander-backup.json";
  link.click();

  URL.revokeObjectURL(url);
  setStatus("settingsStatus", "Yedek dosyası oluşturuldu.");
});

$("importData").addEventListener("click", () => {
  $("importFile").click();
});

$("importFile").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const data = JSON.parse(await file.text());

    if (!Array.isArray(data.shortcuts)) {
      throw new Error("Geçersiz yedek dosyası.");
    }

    const importedPrefix = normalizePrefix(data.triggerPrefix);
    if (importedPrefix && isValidPrefix(importedPrefix)) {
      triggerPrefix = importedPrefix;
      $("triggerPrefix").value = importedPrefix;
    }

    const imported = data.shortcuts.map((item) => {
      if (!item || typeof item !== "object") {
        throw new Error("Geçersiz kısayol.");
      }

      const trigger = normalizeTrigger(item.trigger, triggerPrefix);
      const text = String(item.text ?? item.replacement ?? "");

      if (!trigger || !text.trim()) {
        throw new Error("Yedekte geçersiz bir kısayol var.");
      }

      return { trigger, text };
    });

    const seen = new Set();

    for (const item of imported) {
      if (seen.has(item.trigger)) {
        throw new Error("Yedekte aynı tetikleyici birden fazla kez var.");
      }
      seen.add(item.trigger);
    }

    shortcuts = imported;

    await chrome.storage.local.set({
      shortcuts,
      triggerPrefix
    });

    renderShortcuts();
    setStatus("settingsStatus", "Yedek başarıyla içe aktarıldı.");
  } catch (error) {
    setStatus(
      "settingsStatus",
      error.message || "Dosya okunamadı."
    );
  } finally {
    event.target.value = "";
  }
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.toggle("active", tab === button);
    });

    document.querySelectorAll(".panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === button.dataset.tab);
    });
  });
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;

  if (changes.triggerPrefix) {
    triggerPrefix =
      normalizePrefix(changes.triggerPrefix.newValue) || DEFAULT_PREFIX;
    $("triggerPrefix").value = triggerPrefix;
  }
});

loadData().catch((error) => {
  setStatus("shortcutStatus", `Veriler yüklenemedi: ${error.message}`);
});