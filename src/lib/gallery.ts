import type { CollectionEntry } from 'astro:content';

export const GALLERY_POSTS_PER_PAGE = 10;
export const COMPACT_GALLERY_POSTS_PER_PAGE = 30;
export const ALL_POSTS_PER_PAGE = 50;
export const COMPACT_ALL_POSTS_PER_PAGE = 100;
export type PostListView = 'images' | 'compact';
export type GalleryEntry = CollectionEntry<'gallery'> | CollectionEntry<'minorGallery'>;
export type GalleryKind = 'g' | 'm';

export const getGalleryKind = (gallery: GalleryEntry): GalleryKind => gallery.collection === 'minorGallery' ? 'm' : 'g';
export const getGalleryHref = (gallery: GalleryEntry) => `/${getGalleryKind(gallery)}/${gallery.id}/`;
export const getGalleryContextKey = (gallery: GalleryEntry) => `${getGalleryKind(gallery)}:${gallery.id}`;
export const getGalleryPostHref = (gallery: GalleryEntry, postId: string) =>
  `/posts/${postId}/?${getGalleryKind(gallery)}=${encodeURIComponent(gallery.id)}`;

export interface GalleryPostPage {
  pagePosts: BlogPost[];
  currentPage: number;
  totalPages: number;
}

export function getPostListPageSize(gallery: boolean, view: PostListView) {
  return gallery
    ? (view === 'compact' ? COMPACT_GALLERY_POSTS_PER_PAGE : GALLERY_POSTS_PER_PAGE)
    : (view === 'compact' ? COMPACT_ALL_POSTS_PER_PAGE : ALL_POSTS_PER_PAGE);
}

export function getPostListPageHref(base: string, page: number) {
  return page === 1 ? base : `${base}${page}/`;
}

export function getPostListPage(posts: BlogPost[], requestedPage: number, pageSize: number): GalleryPostPage {
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const start = (currentPage - 1) * pageSize;
  return { pagePosts: posts.slice(start, start + pageSize), currentPage, totalPages };
}

type BlogPost = CollectionEntry<'post'>;

export interface GalleryPostContext {
  gallery: GalleryEntry;
  pagePosts: BlogPost[];
  postCount: number;
  currentPage: number;
  totalPages: number;
  compactPage: GalleryPostPage;
}

export function groupPostsByGallery(posts: BlogPost[], kind: GalleryKind = 'g') {
  const postsByGallery = new Map<string, BlogPost[]>();

  for (const post of posts) {
    for (const category of kind === 'm' ? post.data.mcategories : post.data.categories) {
      const galleryPosts = postsByGallery.get(category.id) ?? [];
      galleryPosts.push(post);
      postsByGallery.set(category.id, galleryPosts);
    }
  }

  for (const galleryPosts of postsByGallery.values()) {
    galleryPosts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
  }

  return postsByGallery;
}

export function getPostGalleryContexts(
  post: BlogPost,
  galleriesById: ReadonlyMap<string, GalleryEntry>,
  postsByGallery: Map<string, BlogPost[]>,
  kind: GalleryKind = 'g',
): GalleryPostContext[] {
  const categories = kind === 'm' ? post.data.mcategories : post.data.categories;
  return categories.flatMap((category) => {
    const gallery = galleriesById.get(category.id);
    const galleryPosts = postsByGallery.get(category.id) ?? [];
    const postIndex = galleryPosts.findIndex((entry) => entry.id === post.id);
    if (!gallery || postIndex < 0) return [];

    const currentPage = Math.floor(postIndex / GALLERY_POSTS_PER_PAGE) + 1;
    const compactCurrentPage = Math.floor(postIndex / COMPACT_GALLERY_POSTS_PER_PAGE) + 1;

    return [{
      gallery,
      ...getPostListPage(galleryPosts, currentPage, GALLERY_POSTS_PER_PAGE),
      postCount: galleryPosts.length,
      compactPage: getPostListPage(galleryPosts, compactCurrentPage, COMPACT_GALLERY_POSTS_PER_PAGE),
    }];
  });
}

export interface GalleryPageProps extends GalleryPostPage {
  gallery: GalleryEntry;
  randomPosts: BlogPost[];
  postCount: number;
  compactPage: GalleryPostPage;
}

/** Both gallery types use the same page sizes, ordering, and route aliases. */
export function createGalleryPaths(galleries: GalleryEntry[], posts: BlogPost[], kind: GalleryKind = 'g') {
  const grouped = groupPostsByGallery(posts, kind);
  return galleries.flatMap((gallery) => {
    const galleryPosts = grouped.get(gallery.id) ?? [];
    const candidates = [...galleryPosts];
    const count = Math.min(4, candidates.length);
    for (let index = 0; index < count; index++) {
      const randomIndex = index + Math.floor(Math.random() * (candidates.length - index));
      [candidates[index], candidates[randomIndex]] = [candidates[randomIndex], candidates[index]];
    }
    const totalPages = Math.max(1, Math.ceil(galleryPosts.length / GALLERY_POSTS_PER_PAGE));
    return Array.from({ length: totalPages }, (_, index) => {
      const page = index + 1;
      const props: GalleryPageProps = {
        gallery, ...getPostListPage(galleryPosts, page, GALLERY_POSTS_PER_PAGE),
        compactPage: getPostListPage(galleryPosts, page, COMPACT_GALLERY_POSTS_PER_PAGE),
        randomPosts: candidates.slice(0, count), postCount: galleryPosts.length,
      };
      return (page === 1 ? [undefined, '1'] : [String(page)])
        .map((page) => ({ params: { category: gallery.id, page }, props }));
    }).flat();
  });
}
