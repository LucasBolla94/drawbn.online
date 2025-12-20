
# Pennodraw Storage Management

Pennodraw uses `localStorage` to persist your creative sessions directly in your browser. This ensures that your work is available even after closing the tab.

## Document Structure
All drawings are saved using the prefix:
`pennodraw_doc_` followed by a unique session hash (e.g., `pennodraw_doc_x8f2k9a`).

## How to Reset/Clear Saved Projects
If you wish to clear all locally saved Pennodraw projects at once, you can follow these steps in your browser:

1. Open Pennodraw in your browser.
2. Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac) to open the **Developer Tools**.
3. Go to the **Console** tab.
4. Copy and paste the following command and press **Enter**:

```javascript
Object.keys(localStorage)
  .filter(key => key.startsWith('pennodraw_doc_'))
  .forEach(key => localStorage.removeItem(key));
location.reload();
```

This script scans your browser's local storage for keys belonging specifically to Pennodraw and removes them, resetting your project count and clearing the workspace history.

---
*Created by Pennodraw Team*
