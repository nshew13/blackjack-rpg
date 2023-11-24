# blackjack-rpg

Card table simulator developed for use with tabletop role-playing games (TTRPGs) that use
standard playing cards instead of dice (and, specifically, [Purgatory House](https://www.wicked-clever.com/purgatory-house/)
and [Starship Infernum](https://www.wicked-clever.com/our-games/starship-infernum/)).

## Requirements

Until this package provides a static build, you will need pnpm, yarn or npm.

### Project Setup

With the package manage installed and this code downloaded, change to the project's
root directory and install its dependencies.

```sh
pnpm install
```

TODO: the built `dist` doesn't work locally because of a CORS error.
```sh
pnpm build
```


## Tech

* TypeScript
* Vue 3
* Vuetify for UI components
* Vite for managing builds
* Vitest for unit testing
* Pinia (maybe?) for data store