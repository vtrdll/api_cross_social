import { useState, useCallback, useEffect } from 'react';
import type { Post } from '@/types';
import api from '@/services/api';

export const usePosts = (authorFilter?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextPage, setNextPage] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = authorFilter ? { author: authorFilter } : {};
      const { data } = await api.get('/posts/', { params });
      
      
      setPosts(data.results || data);
      setNextPage(data.next || null);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setIsLoading(false);
    }
  }, [authorFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const toggleLike = useCallback(async (postId: number) => {
    // Optimistic update
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1 }
          : p
      )
    );
    try {
      await api.post(`/post/${postId}/like/`);
    } catch {
      // Revert on error
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1 }
            : p
        )
      );
    }
  }, []);

  const addComment = useCallback(async (postId: number, comments: string) => {
    try {
      const { data } = await api.post(`/${postId}/comment/`, { comments });
      
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, comments_count: p.comments_count + 1, comments: [...p.comments, data] }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  }, []);

  const deletePost = useCallback(async (postId: number) => {
    try {
      await api.delete(`/posts/${postId}/`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  }, []);

  const createPost = useCallback(async (formData: FormData) => {
    const { data } = await api.post('/post/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextPage) return;
    setIsLoading(true);
    try {
      const { data } = await api.get(nextPage);
      setPosts(prev => [...prev, ...(data.results || data)]);
      setNextPage(data.next || null);
    } catch (err) {
      console.error('Failed to load more', err);
    } finally {
      setIsLoading(false);
    }
  }, [nextPage]);

  return { posts, isLoading, toggleLike, addComment, deletePost, createPost, loadMore, hasMore: !!nextPage, refetch: fetchPosts };
};
