import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../model/post.model.js";
import { User } from "../model/user.model.js";
import { Comment } from "../model/comment.model.js";

// Add a new post
// Fix: Ensure consistency with profilepicture field
export const addNewPost = async (req, res) => {
    try {
        const { caption, content = "" } = req.body;
        const image = req.file;
        const authorId = req.id;  // Assuming this is set from auth middleware

        if (!image) return res.status(400).json({ message: 'Image is required', success: false });
        if (!caption || !authorId) return res.status(400).json({ message: 'Caption and authorId are required', success: false });

        // Process image using sharp
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;

        // Upload image to Cloudinary
        const cloudResponse = await cloudinary.uploader.upload(fileUri);

        // Create new post
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId,
            content  // Default empty string for content
        });

        const user = await User.findById(authorId);
        if (!user) return res.status(404).json({ message: 'User not found', success: false });

        user.posts.push(post._id);
        await user.save();

        // Populate post with author details
        await post.populate({ path: 'author', select: 'username profilepicture' });

        return res.status(201).json({ message: 'Post created successfully', post, success: true });
    } catch (error) {
        console.error("Error in creating post:", error.message);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};


// Get all posts
export const getAllPost = async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: -1 })
        .populate({ path: 'author', select: 'username profilepicture' }) // Use profilepicture here
        .populate({
          path: 'comments',
          options: { limit: 10, sort: { createdAt: -1 } },
          populate: { path: 'author', select: 'username profilepicture' } // Use profilepicture for comment authors as well
        });
  
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
// Get posts of a specific user
export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;  // Assuming this is set from auth middleware
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilepicture' })
            .populate({
                path: 'comments',
                options: { limit: 10, sort: { createdAt: -1 } }, // Limit to 10 comments
                populate: { path: 'author', select: 'username profilepicture' }
            });
        return res.status(200).json({ posts, success: true });
    } catch (error) {
        console.error("Error in fetching user posts:", error.message);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};
// Like a post
export const likePost = async (req, res) => {
    try {
        const userId = req.id; // Assuming this is set from auth middleware
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // Check if the user has already liked the post
        const alreadyLiked = post.likes.includes(userId);
        
        if (alreadyLiked) {
            // If already liked, dislike the post
            await post.updateOne({ $pull: { likes: userId } });
            return res.status(200).json({ message: 'Post disliked', success: true });
        } else {
            // If not liked, like the post
            await post.updateOne({ $addToSet: { likes: userId } });
            return res.status(200).json({ message: 'Post liked', success: true });
        }
    } catch (error) {
        console.error("Error in liking/disliking post:", error.message);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

// Dislike a post
export const dislikePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;  // Assuming this is set from auth middleware
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // Remove the user's ID from the likes array
        await post.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
        await post.save();

        return res.status(200).json({ message: 'Post disliked', success: true });
    } catch (error) {
        console.error("Error in disliking post:", error.message);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

// Add a comment to a post
export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const commentKrneWalaUserKiId = req.id;  // Assuming this is set from auth middleware
        const { text } = req.body;

        if (!text) return res.status(400).json({ message: 'Comment text is required', success: false });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        const comment = await Comment.create({
            text,
            author: commentKrneWalaUserKiId,
            post: postId
        });

        await comment.populate({ path: 'author', select: 'username profilepicture' });

        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({ message: 'Comment added', comment, success: true });
    } catch (error) {
        console.error("Error in adding comment:", error.message);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

// Get all comments for a post
export const getCommentsOfPost = async (req, res) => {
    try {
      const comments = await Comment.find({ post: req.params.postId })
        .populate('author', 'username profilepicture');  // Populate profilepicture for comment authors
  
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
// Delete a post
export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;  // Assuming this is set from auth middleware

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        if (post.author.toString() !== authorId) return res.status(403).json({ message: 'Unauthorized', success: false });

        // Delete the post
        await Post.findByIdAndDelete(postId);

        // Remove the post ID from the user's posts array
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        // Delete associated comments
        await Comment.deleteMany({ post: postId });

        return res.status(200).json({ message: 'Post deleted', success: true });
    } catch (error) {
        console.error("Error in deleting post:", error.message);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

// Bookmark a post
export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;  // Assuming this is set from auth middleware

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        const user = await User.findById(authorId);

        if (user.bookmarks.includes(post._id)) {
            // Post already bookmarked, remove it
            await user.updateOne({ $pull: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ type: 'unsaved', message: 'Post removed from bookmark', success: true });
        } else {
            // Bookmark the post
            await user.updateOne({ $addToSet: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ type: 'saved', message: 'Post bookmarked', success: true });
        }
    } catch (error) {
        console.error("Error in bookmarking post:", error.message);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};
