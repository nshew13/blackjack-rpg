# blackjack-rpg

Card table simulator developed for use with tabletop role-playing games (TTRPGs) that use
standard playing cards instead of dice (and, specifically, [Purgatory House](https://www.wicked-clever.com/purgatory-house/)
and [Starship Infernum](https://www.wicked-clever.com/our-games/starship-infernum/)).

## Use

Simply download the [`index.html`](./dist/index.html) file from the `dist` folder and open it
in your browser. It contains all the code.

### How to play

Add players as needed*. Click on the player name to change it.

Click "Deal" to deal all active players and the House two cards. The House hand will reveal a
blackjack, if dealt.

Click on player hands to deal individual cards ("hit me"), then click "Stand" to prevent further hits.

The House hand stands at 17 and will automatically play out when all players are standing.
You may also click "Finish Hand" to conclude the round. Click on the House hand to "hit" will warn
you if player hands are still active.

Toggle individual players out of rounds, or assign players to groups to quickly switch between parties.


*There is no limit imposed on the number of players the game will support, though a deck of 52 cards
can only support so many concurrent blackjack players.

## Development

See the [Technical Stuff](./tech.md).

## To-do

### General
- [ ] BUG: can't hit with two aces
- [ ] BUG: dealer hidden ace still displays split score
- [ ] BUG: dealer stops with an ace, even when low side < house stay
- [ ] BUG: a House (bust after a Player hold) doesn't signal a win
- [ ] keep score
- [ ] split hand
- [ ] bulk add to group
  - [ ] drag and drop player sorting, grouping
  - [ ] player pinning (doesn't en/disable with group)
- [ ] add unit test for shuffling
- [ ] animate player dis/enabling (group change)
- [ ] save/resume play state
    - [ ] config
    - [ ] cards in each deck
    - [ ] cards in hands?
    - [ ] player setup (names, groups)
- [ ] configure theme/palette
- [ ] add configuration, including
  - [ ] number of decks
  - [ ] hand card size (large or small)
  - [ ] deck includes Jokers
  - [ ] warning before revealing House hand
- [x] BUG: don't deal to disabled players
- [x] show icon for dealer wins
- [x] make win icon more apparent for all
- [x] auto-stand at 21
- [x] animate cards

### Game-specific
- [ ] separate draw deck for game randomization (i.e., one to build the world, the other for player skill checks)
- [ ] add +/- values to player hands (e.g., skill use)
- [ ] auto re-deal with +1 card for players that lose without bust ("rising tension")
- [ ] bust tracker
