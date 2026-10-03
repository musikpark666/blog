# TODO lists

>after implement posting

1. Navigation.astro: `.extra-info` actual implementation
2. Header.astro: **search** implementation
3. Header.astro: **menu, night mode** implementation
4. Footer.astro: **btns** implementation
5. Footer.astro: `.footer-top` wide view
6. Sidebar.astro: implement several **widgets**
7. **About Page** implementation

>bug?

1. Header logo image flicking
2. Page navigation latency (Dev Server error?)

>will be soon

1. improve deploy script (don't copy all)
2. mini gallery - fediverse microblog integrate

>someday

1. remake favicon
2. setting **AD** (Content.astro - left area)
3. focus-visible styling
n. refer to other sites (blog, news, ...)

# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
