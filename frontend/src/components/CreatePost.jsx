import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { addPost } from '../redux/postSlice';  // Import addPost action

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();  // Initialize dispatch

  const fileChangeHandler = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const createPostHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("caption", caption);
    if (file) formData.append("image", file);

    try {
      setLoading(true);
      const res = await axios.post('https://vitclubs.onrender.com/api/v1/post/addpost', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      if (res.data.success) {
        // Dispatch the newly created post to Redux store
        dispatch(addPost(res.data.post));
        toast.success(res.data.message);
        setOpen(false);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)}>
        <DialogHeader className="text-center font-semibold">Create New Post</DialogHeader>
        <div className="flex gap-3 items-center">
          <Avatar>
            <AvatarImage src={user?.profilepicture} alt="user_img" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-xs">{user?.username}</h1>
            <span className="text-gray-600 text-xs">Bio here...</span>
          </div>
        </div>
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="focus-visible:ring-transparent border-none"
          placeholder="Write a caption..."
        />
        {imagePreview && (
          <div className="w-full h-64 flex items-center justify-center">
            <img src={imagePreview} alt="preview_img" className="object-cover h-full w-full rounded-md" />
          </div>
        )}
        <input
          ref={imageRef}
          type="file"
          className="hidden"
          onChange={fileChangeHandler}
        />
        <Button onClick={() => imageRef.current.click()} className="w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]">
          Select from computer
        </Button>
        {imagePreview && (
          loading ? (
            <Button disabled className="w-full flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button onClick={createPostHandler} type="submit" className="w-full">
              Post
            </Button>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
