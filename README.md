# blackjack-rpg

Card table simulator developed for use with tabletop role-playing games (TTRPGs) that use
standard playing cards instead of dice (and, specifically, [Purgatory House](https://www.wicked-clever.com/purgatory-house/)
and [Starship Infernum](https://www.wicked-clever.com/our-games/starship-infernum/)).

## Use

Simply download the [`index.html`](./dist/index.html) file from the `dist` folder. It
contains all the code.

### Technical stuff

Normally, the build process would output separate JS and/or CSS files. When trying to
open the `index.html` file locally, browsers give CORS errors about loading from `file://`.

Instead, these files are in-lined using the
[vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) plugin
for Vite, meaning no file requests are needed.

## Development

To develop and build locally, you will need pnpm, yarn, npm, etc.

### Project Setup

With a package manage installed and this code downloaded, change to the project's
root directory and install its dependencies.

```sh
pnpm install
```

The live dev server is available with `pnpm dev`.

### Technical stuff

This project uses the following technologies:

* TypeScript
* Vue 3
* Quasar
* Vite
* Vitest for unit testing
