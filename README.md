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
- [ ] split hand
- [ ] configure theme/palette
- [ ] add configuration, including
  - [ ] number of decks
  - [ ] hand card size (large or small)
  - [ ] deck includes Jokers
- [ ] bulk add to group
- [ ] animate cards
- [ ] animate player dis/enabling (group change)
- [ ] add unit test for shuffling
- [ ] save/resume play state
  - [ ] config
  - [ ] cards in each deck
  - [ ] cards in hands?
  - [ ] player setup (names, groups)

### Game-specific
- [ ] separate draw deck for game randomization (i.e., one to build the world, the other for player skill checks)
- [ ] add +/- values to player hands (e.g., skill use)
- [ ] auto re-deal with +1 card for players that lose without bust ("rising tension")
- [ ] bust tracker
