# my-blog

This is  my personal blog. 

## TODO lists

>after implement posting

0. **image optimization** (`content.config.ts`, ...)
1. Navigation.astro: `.extra-info` actual implementation
2. Header.astro: **search** implementation
3. Header.astro: **menu, night mode** implementation (++**Theme**)
4. Footer.astro: **btns** implementation
5. Footer.astro: `.footer-top` wide view
6. Sidebar.astro: implement several **widgets**
7. **About Page** implementation
8. GalleryHeader.astro: **relatedSite**, serveral **actions** implementation, **thumnail image styling**, currentPage tracking, info button simplify(only ⓘ)
9. GalleryPostList.astro: currentPage tracking, media query styling(+overflow), several scripting, 

>issue?

1. Header logo image flicking
2. Page navigation latency (Dev Server error?)
3. Sidebar UI broken

>will be soon

1. 
2. remake favicon
3. add socials (GitHub, fix links...)
4. **ellipses** improve (by characters)
5. focus-visible styling
6. heading level organize ([MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements#avoid_using_multiple_h1_elements_on_one_page), [W3C](https://www.w3.org/WAI/tutorials/page-structure/headings/))
7. Views (view count) & Comment
8. GalleryPostList.astro: **sorting** by alphaberic/viewed/comments...
9. aria-labeling
n. refer to other sites (blog, news, ...)

>someday

1. improve deploy script (don't copy all)
2. mini gallery - fediverse microblog integrate

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run deploy`          | Build and deployment to server                   |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |