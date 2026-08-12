RECALLDECK V4 — CACHE-SAFE BUILD

WHY V4:
The screenshot showing only Study/Cards/Add/Progress means the browser is serving the OLD app, not the new code. This version intentionally removes service-worker registration and includes reset.html to unregister old workers and clear caches.

DEPLOY:
1. Extract this ZIP.
2. Replace the files in your GitHub Pages repository with ALL files from this folder.
3. Commit/push and wait for GitHub Pages to deploy.
4. IMPORTANT: open:
   https://YOURUSERNAME.github.io/YOURREPO/reset.html
   using the same URL/path as your app.
5. It will unregister old service workers and clear browser caches WITHOUT deleting your flashcards from localStorage.
6. It redirects to the new app.
7. You should now see:
   Study | Cards | + Add | IMPORT JSON | EXPORT JSON | Progress

If the PWA icon still opens the old screen, remove the old installed PWA shortcut and open the website once in Chrome after the reset. Then install the new PWA.

JSON:
[
  {"front":"What is federalism?","back":"Division of power between levels of government.","deck":"Polity","tag":"Constitution","important":true}
]

Manual adding and JSON bulk import are both supported.
