import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogTrigger } from '@radix-ui/react-dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Link } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';  // Import useSelector

const CommentDialog = ({ open, setOpen, postId, postImage, userprofilepicture }) => {
  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);
  const { user } = useSelector((store) => store.auth);  // Get the current user from auth
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`https://vitclubs.onrender.com//api/v1/post/${postId}/comment/all`);
        if (res.data.success) {
          setComments(res.data.comments);
        } else {
          toast.error('Failed to fetch comments');
        }
      } catch (error) {
        console.error(error);
        toast.error('Error fetching comments');
      }
    };

    if (open) {
      fetchComments();
    }
  }, [open, postId]);

  const changeEventHandler = (e) => {
    setText(e.target.value);
  };

  const sendMessageHandler = async () => {
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        `https://vitclubs.onrender.com//api/v1/post/${postId}/comment`,
        { text },
        { withCredentials: true }
      );

      if (res.data.success) {
        setComments(prevComments => [...prevComments, res.data.comment]);
        toast.success('Comment added successfully');
        setText(""); // Clear the input field
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error adding comment');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="fixed inset-0 bg-black bg-opacity-60 transition-opacity duration-300" />
      <DialogContent
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg max-w-5xl w-full transition-transform duration-300 ease-in-out"
        onInteractOutside={() => setOpen(false)}
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 w-full">
            <img
              src={postImage} // Use postImage prop
              alt="Post image"
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>
          <div className="md:w-1/2 w-full flex flex-col justify-between">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Link to="#">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profilepicture || 'default-avatar-url'} /> {/* Display current user's profile picture */}
                    <AvatarFallback>{user?.username?.charAt(0) || 'U'}</AvatarFallback>  {/* Fallback for avatar */}
                  </Avatar>
                </Link>
                <div>
                  <Link className="font-semibold text-xs">{user?.username || 'Current User'}</Link>  {/* Current user name */}
                  <p className="text-gray-500 text-xs">{user?.bio || 'Bio not available'}</p>  {/* Current user bio */}
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative">
                    <MoreHorizontal className="cursor-pointer" />
                    <DialogContent className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 flex flex-col items-center text-sm text-center">
                      <div className="cursor-pointer w-full text-[#ED4956] font-bold">Unfollow</div>
                      <div className="cursor-pointer w-full">Add to Favourites</div>
                    </DialogContent>
                  </div>
                </DialogTrigger>
              </Dialog>
            </div>

            <hr />

            <div className="flex-1 overflow-y-auto max-h-96 p-4">
              {comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c._id} className="flex items-center mb-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={c.author.profilepicture} alt={c.author.username} />
                      <AvatarFallback>{c.author.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2">
                      <strong>{c.author.username}:</strong> {c.text}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No comments yet.</p>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={changeEventHandler}
                  placeholder="Add a comment..."
                  className="w-full outline-none border text-sm border-gray-300 p-2 rounded"
                />
                <Button disabled={!text.trim()} onClick={sendMessageHandler} variant="outline">
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
