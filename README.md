# RecallDeck V3

Deployable GitHub Pages PWA for flashcards.

## Features
- JSON import with preview and validation
- Append or replace import modes
- Duplicate protection when appending
- JSON export/backup
- Accepted fields: front/question/word/term/q and back/answer/meaning/definition/a
- Practice count: 5, 10, 20, 50, custom, all due
- Random or sequential order
- Spaced repetition ratings
- Search, decks, tags, important cards
- Progress and accuracy
- Offline/local storage

## JSON example
[
  {
    "front": "What is federalism?",
    "back": "A system in which power is divided between levels of government.",
    "deck": "Polity",
    "tag": "Constitution",
    "important": true
  }
]

Upload all files to the root of a GitHub Pages repository.
