import type { CollectionEntry } from 'astro:content';

export const GALLERY_POSTS_PER_PAGE = 2;

type BlogPost = CollectionEntry<'post'>;

export interface GalleryPostContext {
  gallery: CollectionEntry<'gallery'>;
  pagePosts: BlogPost[];
  postCount: number;
  currentPage: number;
  totalPages: number;
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
    const pageStart = (currentPage - 1) * GALLERY_POSTS_PER_PAGE;

    return [{
      gallery,
      pagePosts: galleryPosts.slice(pageStart, pageStart + GALLERY_POSTS_PER_PAGE),
      postCount: galleryPosts.length,
      currentPage,
      totalPages: Math.ceil(galleryPosts.length / GALLERY_POSTS_PER_PAGE),
    }];
  });
}
