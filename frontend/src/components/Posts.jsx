import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removePost as removePostAction } from '../redux/postSlice'; // Adjust the path
import Post from './Post'; // Import the Post component

const Posts = () => {
  const { posts } = useSelector(store => store.post);
  const dispatch = useDispatch();
  const [postList, setPostList] = useState(posts);  // Keep track of posts locally

  // Synchronize postList with Redux state if posts change
  useEffect(() => {
    setPostList(posts);
  }, [posts]);

  const removePost = (postId) => {
    // Remove the post locally
    const updatedPostList = postList.filter(post => post._id !== postId);
    setPostList(updatedPostList);

    // Dispatch action to remove the post from Redux store
    dispatch(removePostAction(postId));  // Dispatch the removePost action to Redux
  };

  return (
    <div>
      {postList && postList.length > 0 ? (
        postList.map(post => (
          <Post key={post._id} post={post} removePost={removePost} />  // Pass removePost function to Post
        ))
      ) : (
        <div>No posts available</div>
      )}
    </div>
  );
};

export default Posts;
