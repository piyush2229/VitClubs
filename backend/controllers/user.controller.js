import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import sharp from "sharp";
export const register = async (req, res) => {
    try {
        const { username, password, email, college, isAdmin, type } = req.body;

        // Validation to check for all required fields
        if (!username || !password || !email || !college) {
            return res.status(400).json({ message: 'All fields are required', success: false });
        }

        // Check if the email is already registered
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email already exists', success: false });
        }

        // Hash the password before saving the user
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user in the database, including isAdmin and type fields
        await User.create({ 
            username, 
            email, 
            password: hashedPassword, 
            college, 
            isAdmin: isAdmin || false,  // Set default value if not provided
            type: type || 'student'  // Default to 'student' if type is not provided
        });
        
        return res.status(201).json({ message: 'Account created successfully', success: true });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message }); // Temporarily return the actual error message
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;  // password from request body

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }

        // Find user by email
        let user = await User.findOne({ email }).populate('posts'); // Populating posts if any
        
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        // Compare provided password with the stored hashed password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        // Generate JWT token
        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        // Exclude password from the user object and return all required fields
        const { password: hashedPassword, ...userDetails } = user._doc;  // Rename the destructured password to avoid conflict

        // Send the cookie with the token and return the user details
        return res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
        }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user: userDetails,  // User details excluding password
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
};


export const logout= async(_,res)=>{
    try {
        return res.clearCookie('token',{httpOnly:true,sameSite:'strict',maxAge:0}).json({message:'Logged Out Successfully',success:true});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

export const getProfile = async (req, res) => {
    console.log("Requested user ID:", req.params.id);  
    try {
        const user = await User.findById(req.params.id)
    .populate({
        path: 'posts',
        options: { sort: { createdAt: -1 } }, // Sort posts by createdAt in descending order
    })
    .populate({
        path: 'bookmarks',
        options: { sort: { createdAt: -1 } }, // Sort bookmarks by createdAt in descending order
    });


        if (!user) {
            console.log("No user found for ID:", req.params.id);  
            return res.status(404).json({ message: 'User not found', success: false });
        }

        console.log("User found:", user);  // Log the user object to inspect data
        return res.status(200).json({
            user,
            success: true
        });
    } catch (e) {
        console.error('Error fetching profile:', e);  // Log the error for debugging
        return res.status(500).json({ message: 'Server error', success: false });
    }
};


const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        uploadStream.end(buffer);
    });
};
export const editProfile = async (req, res) => {
    try {
        const userId = req.id; // Get user ID from authenticated session
        const { bio, gender, club } = req.body; // Extract bio, gender, and club from request body
        const profilepicture = req.file; // Get the uploaded profile photo

        let cloudResponse;
        if (profilepicture) {
            const buffer = await sharp(profilepicture.buffer)
                .resize({ width: 500, height: 500, fit: sharp.fit.cover })
                .toFormat('jpeg')
                .jpeg({ quality: 80 })
                .toBuffer();

            try {
                cloudResponse = await uploadToCloudinary(buffer);
            } catch (error) {
                return res.status(500).json({ message: 'Error uploading profile picture', success: false });
            }
        }

        // Find the user by ID
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        // Update bio, gender, and club if provided
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (club) user.club = club;

        // If a new profile picture is uploaded, update the user's profile picture URL
        if (profilepicture && cloudResponse) {
            user.profilepicture = cloudResponse.secure_url;
        }

        // Save the updated user profile
        await user.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            user,
            success: true,
        });
    } catch (error) {
        console.error(error); // To help debug errors
        return res.status(500).json({ message: 'Server Error', success: false });
    }
};



export const getSuggestedUser = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error);
    }
};
export const followOrUnfollow = async (req, res, next) => {
    try {
      // Ensure the user is authenticated and has an 'id'
      const followKrneWala = req.id;  // The user who is following/unfollowing
      if (!followKrneWala) {
        return res.status(400).json({ message: 'User not authenticated', success: false });
      }
  
      const jiskoFollowKrunga = req.params.id;  // The target user to follow/unfollow
  
      // Prevent self-follow
      if (followKrneWala === jiskoFollowKrunga) {
        return res.status(401).json({ message: 'You cannot follow yourself', success: false });
      }
  
      // Fetch both the user and target user
      const user = await User.findById(followKrneWala);
      const targetUser = await User.findById(jiskoFollowKrunga);
  
      // Check if both users exist
      if (!user || !targetUser) {
        return res.status(404).json({ message: 'User not found', success: false });
      }
  
      const isFollowing = user.following.includes(jiskoFollowKrunga);  // Check if already following
  
      if (isFollowing) {
        // Unfollow the user
        await Promise.all([
          User.updateOne({ _id: followKrneWala }, { $pull: { following: jiskoFollowKrunga } }),
          User.updateOne({ _id: jiskoFollowKrunga }, { $pull: { followers: followKrneWala } })
        ]);
        return res.status(200).json({ message: 'Successfully unfollowed', success: true });
      } else {
        // Follow the user
        await Promise.all([
          User.updateOne({ _id: followKrneWala }, { $push: { following: jiskoFollowKrunga } }),
          User.updateOne({ _id: jiskoFollowKrunga }, { $push: { followers: followKrneWala } })
        ]);
        return res.status(200).json({ message: 'Successfully followed', success: true });
      }
  
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: 'Server error', success: false });
    }
  };

  export const searchUsers = async (req, res) => {
  try {
    const query = req.query.query?.trim();
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Create a regex pattern that's case insensitive
    const searchPattern = new RegExp(query, 'i');

    // Search across multiple fields
    const users = await User.find({
      $or: [
        { username: { $regex: searchPattern } },
        { college: { $regex: searchPattern } },
        { club: { $regex: searchPattern } },
        { interests: { $elemMatch: { $regex: searchPattern } } }
      ]
    })
    .select('-password -__v') // Exclude sensitive fields
    .limit(20); // Limit results for better performance

    if (!users.length) {
      return res.json({ 
        results: [],
        message: 'No users found matching your search criteria'
      });
    }

    res.json({
      results: users,
      count: users.length
    });

  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch search results',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};