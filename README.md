# musik.gallery

Source code for [musik.gallery](https://musik.gallery), a static blog built with Astro. Articles are written in Markdown and MDX, and gallery metadata is stored in YAML.

## Getting started

The development server URL is printed on startup. The default port is `4321`.

| Command | Description |
| --- | --- |
| `npm run astro -- dev status` | Check the background development server status |
| `npm run astro -- dev logs` | View development server logs |
| `npm run astro -- dev stop` | Stop the development server |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run deploy` | Build and deploy to the server (requires `.env.deploy`) |

## Project structure

```text
src/
├── components/         # Shared UI and page layouts in layouts/
├── content/
│   ├── post/           # Markdown and MDX articles
│   ├── gallery/        # Regular galleries
│   ├── minor-gallery/  # Minor galleries
│   ├── minor-gallery-groups.yaml  # Groups for the minor gallery directory
│   └── quotes.yaml    # Quotes
├── content.config.ts  # Content schemas
├── pages/             # Pages and routes
├── lib/               # Shared logic
├── styles/            # Shared styles and theme colors
└── assets/            # Images and other build assets
public/                # Static files served as-is
```

An article's `categories` and `mcategories` reference regular and minor gallery IDs, respectively. Minor gallery IDs are filenames without extensions, using lowercase English words separated by hyphens.

`src/content/`, `src/assets/`, and environment files are excluded from Git and must be provided separately.
