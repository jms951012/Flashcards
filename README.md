RECALLDECK V4.1 — IMPORT FIX

The screenshot showed:
Found 223 items. Valid flashcards: 0.
The old importer only accepted a narrow front/back schema, so it silently had nothing to import.

V4.1 accepts:
- front/back
- question/answer
- q/a
- word/meaning
- term/definition
- prompt/response
- concept/explanation
- English/Marathi/Hindi vocabulary objects
- nested cards/flashcards
- top-level cards, flashcards, questions, items, data, words, vocabulary, bank arrays
- simple two-field objects as a fallback

DEPLOY:
Replace ALL files with this ZIP in the GitHub Pages repository.
Then open reset.html once to remove the old service worker/cache.
Open the site directly in Chrome and verify V4.1 is shown.

IMPORTANT:
The importer never uploads the JSON to a server. It reads the selected file locally in the browser.
