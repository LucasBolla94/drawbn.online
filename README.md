
# Pennodraw Project Storage

Pennodraw manages projects in a specialized "Vault" located within your browser's local storage. Each project is assigned a unique hash and saved independently.

## Data Organization
- **Folder Prefix**: `pennodraw_doc_`
- **Counter**: The application counts every unique instance of this prefix in real-time.

## How to Manage/Zero the Data
To completely reset your "PennoDrawrs" counter and delete all saved folder contents, follow these steps:

### Zeroing (Clear All)
1. Open the Pennodraw WebApp.
2. Press `F12` to open Developer Tools.
3. Go to the **Console** tab.
4. Execute the following script:

```javascript
// Scan and remove all Pennodraw documents
Object.keys(localStorage)
  .filter(key => key.startsWith('pennodraw_doc_'))
  .forEach(key => localStorage.removeItem(key));

// Clear manifest if any
localStorage.removeItem('pennodraw_manifest');

// Refresh app
location.reload();
```

### Manual Backup (Save Folder)
To extract all data before zeroing, run this in the console:

```javascript
(function() {
  const vault = {};
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('pennodraw_doc_')) {
      vault[key] = JSON.parse(localStorage.getItem(key));
    }
  });
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vault));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "pennodraw_vault_backup.json");
  downloadAnchor.click();
})();
```

---
*Production ready. Mobile optimized. Privacy first.*
