import { createSlice } from '@reduxjs/toolkit';
const postSlice = createSlice({
  name: 'post',
  initialState: {
    posts: [],  // Store posts here
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    removePost: (state, action) => {
      state.posts = state.posts.filter(post => post._id !== action.payload);
    },
    updatePostLikes: (state, action) => {
      const { postId, updatedLikes } = action.payload;
      const post = state.posts.find(post => post._id === postId);
      if (post) {
        post.likes = updatedLikes;
      }
    },
    updatePostComments: (state, action) => {
      const { postId, updatedComments } = action.payload;
      const post = state.posts.find(post => post._id === postId);
      if (post) {
        post.comments = updatedComments;
      }
    },
    toggleBookmark: (state, action) => {
      const postId = action.payload;
      const post = state.posts.find(post => post._id === postId);
      if (post) {
        post.bookmarked = !post.bookmarked; // Toggle the bookmark status
      }
    },
    toggleFollowStatus: (state, action) => {
      const { authorId, isFollowing } = action.payload;
      const user = state.user;

      if (isFollowing) {
        user.following.push(authorId);
      } else {
        user.following = user.following.filter(id => id !== authorId);
      }
    },
  },
});

export const { setPosts, addPost, removePost, updatePostLikes, updatePostComments, toggleBookmark, toggleFollowStatus } = postSlice.actions;
export default postSlice.reducer;
