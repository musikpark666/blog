import type { CollectionEntry } from 'astro:content';

export const GALLERY_POSTS_PER_PAGE = 10;
export const COMPACT_GALLERY_POSTS_PER_PAGE = 30;
export const ALL_POSTS_PER_PAGE = 50;
export const COMPACT_ALL_POSTS_PER_PAGE = 100;
export type PostListView = 'images' | 'compact';

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
  gallery: CollectionEntry<'gallery'>;
  pagePosts: BlogPost[];
  postCount: number;
  currentPage: number;
  totalPages: number;
  compactPage: GalleryPostPage;
}

export function groupPostsByGallery(posts: BlogPost[]) {
  const postsByGallery = new Map<string, BlogPost[]>();

  for (const post of posts) {
    for (const category of post.data.categories) {
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
  galleriesById: Map<string, CollectionEntry<'gallery'>>,
  postsByGallery: Map<string, BlogPost[]>,
): GalleryPostContext[] {
  return post.data.categories.flatMap((category) => {
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
