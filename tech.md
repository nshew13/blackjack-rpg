# blackjack-rpg technical stuff

## Build

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

## Packages/tech stack

This project uses the following technologies:

* TypeScript
* Vue 3
* Quasar
* Vite
* Vitest
