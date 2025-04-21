import { Avatar } from '@radix-ui/react-avatar';
import React, { useState, useEffect } from 'react';
import { AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Bookmark, MoreHorizontal, Lightbulb, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import axios from 'axios';
import { updatePostLikes, updatePostComments, toggleBookmark } from '../redux/postSlice';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';

function Post({ post, removePost }) {
  const dispatch = useDispatch();  
  const navigate = useNavigate();
  const { caption, image, author, _id: postId, likes = [], comments = [], bookmarked = false } = post;
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);
  const [localComments, setLocalComments] = useState(comments);
  const [loadingComments, setLoadingComments] = useState(false);
  const profilepicture = author?.profilepicture || 'default-avatar-url';
  const { user } = useSelector((store) => store.auth);
  const [isFollowing, setIsFollowing] = useState(user?.following?.includes(author._id) || false);
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);  // Track bookmarked state

  const toggleFollowHandler = async () => {
    try {
      const res = await axios.post(
        `https://vitclubs.onrender.com//api/v1/user/followorunfollow/${author._id}`,
        null,
        { withCredentials: true }
      );
  
      if (res.data.success) {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? 'Unsubscribed successfully' : 'Subscribed successfully');
      } else {
        toast.error('Failed to update follow status');
      }
    } catch (error) {
      console.error('Error Response:', error.response);
      toast.error(error.response?.data?.message || 'Error updating follow status');
    }
  };

  const changeEventHandler = (e) => setText(e.target.value);

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(`https://vitclubs.onrender.com//api/v1/post/delete/${postId}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        toast.success('Post deleted successfully');
        removePost(postId);
      } else {
        toast.error('Failed to delete post');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error deleting the post');
    }
  };

  const likePostHandler = async () => {
    const isLiked = localLikes.includes(user._id);
    const updatedLikes = isLiked
      ? localLikes.filter(id => id !== user._id)  
      : [...localLikes, user._id];  

    try {
      setLocalLikes(updatedLikes);

      const res = await axios.post(
        `https://vitclubs.onrender.com//api/v1/post/${postId}/${isLiked ? 'dislike' : 'like'}`,
        null,
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(updatePostLikes({ postId, updatedLikes }));
        toast.success(isLiked ? 'Post unliked successfully' : 'Post liked successfully');
      } else {
        setLocalLikes(likes);
        toast.error('Failed to update like status');
      }
    } catch (error) {
      setLocalLikes(likes);
      console.error(error);
      toast.error(error.response?.data?.message || 'Error updating like status');
    }
  };

  const submitCommentHandler = async () => {
    if (!text) return;
  
    try {
      const res = await axios.post(
        `https://vitclubs.onrender.com//api/v1/post/${postId}/comment`,
        { text },
        { withCredentials: true }
      );
  
      if (res.data.success) {
        toast.success('Comment added successfully');
        const newComment = res.data.comment;
        setLocalComments([...localComments, newComment]);
        dispatch(updatePostComments({ postId, updatedComments: [...localComments, newComment] }));
        setText('');
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error adding comment');
    }
  };

  const fetchCommentsHandler = async () => {
    setLoadingComments(true);
    try {
      const res = await axios.get(`https://vitclubs.onrender.com//api/v1/post/${postId}/comments`, { withCredentials: true });
      if (res.data.success) {
        setLocalComments(res.data.comments);
        dispatch(updatePostComments({ postId, updatedComments: res.data.comments }));
      } else {
        toast.error('Failed to fetch comments');
      }
    } catch (error) {
      console.error(error);
    }
    setLoadingComments(false);
  };

  useEffect(() => {
    if (open) {
      fetchCommentsHandler();
    }
  }, [open]);

  const toggleCommentDialog = () => setOpen(!open);

  const navigateToProfile = () => {
    navigate(`/profile/${author._id}`);  // Navigate to the author's profile
  };

  const isPostLiked = localLikes.includes(user._id);

  // Bookmark Post Handler
  const bookmarkPostHandler = async () => {
    try {
      const res = await axios.get(`https://vitclubs.onrender.com//api/v1/post/${postId}/bookmark`, {
        withCredentials: true
      });
  
      if (res.data.success) {
        setIsBookmarked(!isBookmarked);  // Toggle the bookmarked state
        dispatch(toggleBookmark(postId));  // Update Redux store
        toast.success(res.data.message);
      } else {
        toast.error('Failed to bookmark/unbookmark the post');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error bookmarking the post');
    }
  };
  

  return (
    <div className='my-8 w-full max-w-sm mx-auto'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Avatar className="w-9 h-9 rounded-full border-collapse">
            <AvatarImage
              src={profilepicture}
              alt="User's avatar"
              className="object-cover rounded-full"
            />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className='flex items-center gap-6'>
            <h1
              onClick={navigateToProfile}  // Add onClick handler
              className='italic text-gray-600 text-lg cursor-pointer'
            >
              {author.username}
            </h1>
            {user._id === author._id && <Badge variant="secondary">Own</Badge>}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className='cursor-pointer' />
          </DialogTrigger>
          <DialogContent className='flex flex-col items-center text-sm text-center'>
            {user && user._id !== author._id && (
              <Button
                variant='ghost'
                className='cursor-pointer w-fit font-bold'
                onClick={toggleFollowHandler}
              >
                {isFollowing ? 'Unsubscribe' : 'Subscribe'}
              </Button>
            )}
            <Button variant='ghost' className='cursor-pointer w-fit'>Add to Favourites</Button>
            {user && user._id === author._id && (
              <Button onClick={deletePostHandler} variant='ghost' className='cursor-pointer w-fit'>
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className='w-full my-2'>
        <img
          src={image}
          alt="Post"
          className='w-full h-full object-cover rounded-sm'
        />
      </div>

      <div className='flex items-center justify-between my-2'>
        <div className='flex items-center gap-3'>
          <Lightbulb
            onClick={likePostHandler}
            className={`cursor-pointer ${isPostLiked ? 'text-yellow-500' : 'hover:text-gray-600'}`}
            size={'22px'}
          />
          <HelpCircle
            onClick={toggleCommentDialog}
            className='cursor-pointer hover:text-gray-600'
            size={'22px'}
          />
        </div>
        <Bookmark 
          onClick={bookmarkPostHandler}
          className={`cursor-pointer ${isBookmarked ? 'text-yellow-500' : 'hover:text-gray-600'}`}  // Change color when bookmarked
        />

      </div>

      <span className='font-medium block mb-2'>{localLikes.length} likes</span>
      <p className='flex gap-1'>
        <span className='font-medium block mb-2'>{author.username}</span>
        {caption}
      </p>

      <span onClick={toggleCommentDialog} className='text-gray-600 cursor-pointer text-sm'>
        {open ? `Hide Comments` : `View all ${localComments.length} Comments`}
      </span>
      {open && (
        <div className='mt-2'>
          {loadingComments ? (
            <p>Loading comments...</p>
          ) : (
            localComments.map((comment) => (
              <div key={comment._id} className='my-2'>
                <strong>{user?.username || 'Unknown User'}</strong>: {comment.text}
              </div>
            ))
          )}
        </div>
      )}

      <div className='flex gap-3'>
        <input
          type="text"
          value={text}
          onChange={changeEventHandler}
          placeholder="Add a comment"
          className="border rounded-lg p-2 w-full"
        />
        <button
          onClick={submitCommentHandler}
          className="border rounded-lg p-2 bg-blue-500 text-white"
        >
          Post
        </button>
      </div>
    </div>
  );
}

export default Post;
