Here is a complete README for your repository, integrating today's discoveries with the `web-ext` workflow you provided.

```markdown
# Zotero 7/8 Plugin Development Sandbox

This repository documents a reliable, hot‑reloading development environment for Zotero plugins (versions 7 and 8). It bypasses the legacy “proxy file” method, which often fails due to Zotero’s aggressive extension caching, and instead uses Mozilla’s `web-ext` CLI tool to inject the plugin directly into a temporary Zotero profile with automatic reloading.

## What We Achieved

- **Confirmed a working baseline** – The official `make-it-red` plugin (Zotero 7‑compatible, `src-2.0`) runs successfully on Zotero 8 (and 9).
- **Discovered a reliable way to get UI element IDs** – Using Zotero’s built‑in **Run JavaScript** tool (`Tools → Developer → Run JavaScript`), we can query the live interface without guessing or inspecting source code.
- **Verified correct syntax for UI manipulation** – Inside the `addToWindow(window)` function of `make-it-red.js`, we can:
  - Rename a menu: `toolsMenu.setAttribute('label', 'New Name')`
  - Hide a menu or button: `helpMenu.hidden = true`
- **Learned how to debug** – Use `Zotero.debug()` and check the **Error Console** (`Tools → Developer → Error Console`).

## Prerequisites

- [Node.js](https://nodejs.org/) (provides the `npx` package runner)
- Zotero 7 or Zotero 8 installed locally

## 1. Manifest Validation Patch

Zotero 7/8 are built on Firefox ESR 115. Mozilla’s `web-ext` tool requires a valid `gecko` block in `manifest.json`. Many Zotero plugins only declare a `zotero` block, which causes a validation error.

Open your `manifest.json` (e.g., `src-2.0/manifest.json`) and **add** a `gecko` object inside `applications` (or `browser_specific_settings`). The `id` must match your plugin’s Zotero ID.

```json
{
  "manifest_version": 2,
  "name": "Your Plugin Name",
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

> **Note:** Firefox ESR 115 is the foundation for Zotero 7, so `115.0` is the standard `strict_min_version` for the `gecko` block.

## 2. Running the Sandbox

Navigate to your plugin’s root directory (the one containing the `manifest.json` folder, e.g., `src-2.0`). Run `npx web-ext run` with the appropriate flags for your operating system.

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

*Adjust `--source-dir` if your `manifest.json` is in a different folder (e.g., `./src`).*

## 3. Development Workflow

- The command launches a **temporary, isolated Zotero profile** – your normal library and settings are untouched.
- `web-ext` watches the source directory for file changes.
- **Any saved change** (to `.js`, `.css`, `.ftl`, etc.) triggers an automatic hot‑reload of the plugin inside Zotero. No manual restart is required.

### Quick UI Customisation Checklist

1. **Find the element ID**  
   Open Zotero’s **Run JavaScript** tool (`Tools → Developer → Run JavaScript`).  
   *List all main menu IDs:*  
   ```javascript
   let menus = document.querySelectorAll('#main-menubar > menu');
   Array.from(menus).map(m => m.id).join('\n');
   ```
   *List all toolbar button IDs:*  
   ```javascript
   let btns = document.querySelectorAll('[id^="zotero-tb-"]');
   Array.from(btns).map(b => b.id).join('\n');
   ```

2. **Edit `make-it-red.js` (or your main script)**  
   Put your UI modifications inside the `addToWindow(window)` function. Example:
   ```javascript
   addToWindow(window) {
       let doc = window.document;
       // … existing code …
       
       // Rename the "Tools" menu
       let toolsMenu = doc.getElementById('menu_Tools');
       if (toolsMenu) toolsMenu.setAttribute('label', 'My Custom Tools');
       
       // Hide the "Help" menu
       let helpMenu = doc.getElementById('menu_Help');
       if (helpMenu) helpMenu.hidden = true;
       
       // Hide the "New Item" toolbar button
       let newItemBtn = doc.getElementById('zotero-tb-new-item');
       if (newItemBtn) newItemBtn.hidden = true;
   }
   ```

3. **Debug with the Error Console**  
   Add `Zotero.debug("Your message")` inside your code, then open **Tools → Developer → Error Console** to see the output.

## Troubleshooting

| Symptom | Likely Fix |
|---------|-------------|
| `missing "applications.gecko" property` | Add the `gecko` block to `manifest.json` (see Section 1). |
| Plugin loads but UI changes don’t appear | Verify you placed the code inside `addToWindow(window)`, not `startup()`. |
| `return not in function` error in Run JavaScript | Use expressions without `return`; the tool displays the last evaluated value. |
| Changes don’t hot‑reload | Ensure `web-ext` is still running in the terminal. Kill and re‑run if needed. |

## Next Steps

- Pick a specific UI element (menu, button, field) you want to modify.
- Use the Run JavaScript snippets above to find its exact `id`.
- Add the one‑line modification to `addToWindow()`.
- Watch it reload instantly.

You now have a fast, reliable development loop for Zotero 7/8 plugins. Happy hacking!
```

This README is ready to be placed at the root of your repository. It combines your working `web-ext` setup with the practical UI‑discovery and modification techniques we validated today.