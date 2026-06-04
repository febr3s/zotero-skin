## 📌 Overview

This repository provides a **reliable, hot‑reloading development sandbox** for Zotero plugins (versions 7, 8, and 9). It bypasses the legacy “proxy file” method – which often fails due to Zotero's aggressive extension caching – and uses Mozilla’s `web-ext` CLI tool to inject the plugin into a temporary Zotero profile with automatic reloading on file changes.

**What this sandbox gives you:**
- ✅ A working baseline (the official `make-it-red` plugin runs without errors)
- ✅ A reliable method to discover UI element IDs using Zotero’s built‑in **Run JavaScript** tool
- ✅ Verified syntax for renaming and hiding menus/buttons inside `addToWindow(window)`
- ✅ Real‑time debugging via `Zotero.debug()` and the **Error Console**

---

## 🧬 Origin & Acknowledgements

This work is a **direct clone** of the official Zotero sample plugin:  
[`zotero/make-it-red`](https://github.com/zotero/make-it-red) (specifically the `src-2.0` folder).

**Modifications and this documentation were developed with help from DeepSeek-V3.** : https://chat.deepseek.com/share/y87imjr9ow8gqc1r8h
All original code is used under the **Mozilla Public License 2.0**. No additional copyright is claimed – this is **open source** and free to use, modify, and distribute.

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (includes `npx`)
- Zotero 7, 8, or 9 installed locally ([download](https://www.zotero.org/download/))

---

## ⚙️ Setup: Manifest Validation Patch

Zotero 7/8 are built on **Firefox ESR 115**. Mozilla’s `web-ext` tool requires a valid `gecko` block in `manifest.json`. Many Zotero plugins only declare a `zotero` block, causing a validation error.

Open `src-2.0/manifest.json` (or your plugin’s source folder) and ensure the `applications` object contains both `gecko` and `zotero` entries:

```json
{
  "manifest_version": 2,
  "name": "Zotero UI Customization Sandbox",
  "version": "1.0",
  "applications": {
    "gecko": {
      "id": "your-plugin-id@zotero.org",
      "strict_min_version": "115.0"
    },
    "zotero": {
      "id": "your-plugin-id@zotero.org",
      "strict_min_version": "7.0.0-beta.1",
      "strict_max_version": "9.*"
    }
  }
}
```

> **Note:** The `gecko.id` must match the `zotero.id`. The `strict_min_version` for gecko is always `115.0` (Firefox ESR foundation).

---

## 🚀 Running the Sandbox

Navigate to the root of your repository in a terminal. Run the appropriate `npx web-ext run` command for your operating system.

### Linux
```bash
npx web-ext run --source-dir ./src-2.0 --firefox="/usr/bin/zotero"
```

### macOS
```bash
npx web-ext run --source-dir ./src-2.0 --firefox="/Applications/Zotero.app/Contents/MacOS/zotero"
```

### Windows
```bash
npx web-ext run --source-dir ./src-2.0 --firefox="C:\Program Files\Zotero\zotero.exe"
```

*Adjust `--source-dir` if your `manifest.json` is in a different subfolder (e.g., `./src`).*

---

## 🔄 Development Workflow

- The command launches a **temporary, isolated Zotero profile** – your normal library and settings remain untouched.
- `web-ext` watches the source directory for any file changes.
- **Every saved change** (`.js`, `.css`, `.ftl`, etc.) automatically triggers a hot‑reload of the plugin inside the running Zotero instance – **no manual restart needed**.

### 🕵️ Discovering UI Element IDs (No Guessing)

Use Zotero’s built‑in **Run JavaScript** tool (`Tools → Developer → Run JavaScript`). Paste these expressions and click **Run**:

**List all main menu IDs:**
```javascript
let menus = document.querySelectorAll('#main-menubar > menu');
Array.from(menus).map(m => m.id).join('\n');
```

**List all toolbar button IDs:**
```javascript
let btns = document.querySelectorAll('[id^="zotero-tb-"]');
Array.from(btns).map(b => b.id).join('\n');
```

**Test a specific element (e.g., `menu_Tools`):**
```javascript
let el = document.getElementById('menu_Tools');
el ? el.getAttribute('label') : 'not found';
```

> **Important:** Do **not** use `return` in these snippets – the tool automatically displays the last evaluated expression.

---

## ✏️ Making UI Changes

All UI modifications **must** be placed inside the `addToWindow(window)` function of `make-it-red.js` (or your own main script). This ensures changes apply to every Zotero window.

### Example: Rename Tools menu, hide Help menu, hide New Item button

```javascript
addToWindow(window) {
    let doc = window.document;
    // … existing make-it-red code (green checkbox, etc.) …

    // --- Your custom edits ---
    let toolsMenu = doc.getElementById('menu_Tools');
    if (toolsMenu) toolsMenu.setAttribute('label', 'My Custom Tools');

    let helpMenu = doc.getElementById('menu_Help');
    if (helpMenu) helpMenu.hidden = true;

    let newItemBtn = doc.getElementById('zotero-tb-new-item');
    if (newItemBtn) newItemBtn.hidden = true;
    // --- End edits ---
}
```

### Debugging with the Error Console

Add `Zotero.debug("Your message")` inside your code, then open **Tools → Developer → Error Console** to see the output.

---

## 🐛 Troubleshooting

| Symptom | Likely Fix |
|---------|-------------|
| `missing "applications.gecko" property` | Add the `gecko` block to `manifest.json` (see above). |
| Plugin loads but UI changes don’t appear | Ensure code is inside `addToWindow(window)`, not `startup()`. |
| `return not in function` error in Run JavaScript | Use expressions without `return`; the tool prints the last value. |
| Hot‑reload not working | Check that `web-ext` is still running in the terminal. Kill and re‑run if necessary. |
| Zotero complains about “incompatible version” | Verify `strict_min_version` and `strict_max_version` in the `zotero` block match your installed version. |

---

## 📁 Repository Structure

```
.
├── src-2.0/                 # Plugin source (based on make-it-red)
│   ├── bootstrap.js
│   ├── chrome.manifest
│   ├── locale/
│   ├── make-it-red.js       # ← main UI logic
│   └── manifest.json
├── .gitignore
├── LICENSE
└── README.md                # This file
```

---

## 🤝 Contributing

Issues and pull requests are welcome. Please test your changes using the `web-ext` workflow before submitting.

---

## 📄 License

This project incorporates code from the [zotero/make-it-red](https://github.com/zotero/make-it-red) sample plugin, which is licensed under the **Mozilla Public License 2.0**. All modifications are released under the same license. **No additional copyright is claimed** – this is fully open source.

---

## 🙏 Final Note

This sandbox was built to **stop guessing and start working**. If you find a more reliable method or discover additional Zotero 9‑specific nuances, please open an issue or a pull request. Happy customizing!
```

You can now copy this content into your `README.md`. Replace `your-plugin-id@zotero.org` with your actual plugin ID if needed, and adjust any repository‑specific links. The badges will work as soon as the repository is public on GitHub.