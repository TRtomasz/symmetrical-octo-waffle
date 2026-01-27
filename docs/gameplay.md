# Gameplay Requirements

## Assumptions
- This document defines requirements for a word-search style game because no existing gameplay rules were provided in the repository. If a different game format is intended, these requirements should be revised accordingly.

## Target Word List (Exact)
The game must include **only** the following five target words, spelled exactly as shown (case-insensitive matching is acceptable for gameplay input):
- ADEX
- BILLIONS
- NETWORK
- ATTESTATION
- PARTNERSHIP

## Permitted Words
- **No additional target words are permitted.** Only the five words listed above should be considered valid for completion.
- Players may visually scan the grid freely, but only the listed words count toward completion.

## Expected Player Flow
1. **Start**: Player lands on the puzzle screen and is shown the word list and the letter grid.
2. **Play**: Player selects letters in the grid to form words.
3. **Completion Criteria**: The game is complete when all five target words have been correctly found and confirmed.

## Grid Size & Placement Rules
- **Grid size**: Must be large enough to place the longest word (PARTNERSHIP, 11 letters). Minimum grid dimension is **11x11**.
- **Placement**: Words must be placed in straight lines only: horizontal, vertical, or diagonal.
- **Direction**: Words may appear forwards or backwards along any allowed line.
- **Letter reuse**: Letters may be reused across different words (overlapping characters are allowed).
