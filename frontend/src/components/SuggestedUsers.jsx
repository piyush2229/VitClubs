import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SuggestedUsers = () => {
    const { suggestedUsers, user } = useSelector(store => store.auth); // Get current user from Redux state
    const dispatch = useDispatch();

    // Check if suggestedUsers exists and is an array
    const usersToDisplay = suggestedUsers || [];

    // Ensure that `user` is not null or undefined
    const userFollowing = user ? user.following : [];

    return (
        <div className="my-10">
            <div className="flex items-center justify-between text-sm">
                <h1 className="font-semibold text-blue-900">Others Profiles</h1>
            </div>
            {usersToDisplay.map((suggestedUser) => {
                // Determine if the logged-in user is already following the suggested user
                const isSubscribed = userFollowing.some(follow => follow._id === suggestedUser._id);

                return (
                    <div key={suggestedUser._id} className="flex items-center justify-between my-5">
                        <div className="flex items-center gap-2">
                            <Link to={`/profile/${suggestedUser._id}`}>
                                <Avatar>
                                    <AvatarImage src={suggestedUser.profilepicture} alt="user profile" />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div>
                                <h1 className="font-semibold text-sm">
                                    <Link to={`/profile/${suggestedUser._id}`}>{suggestedUser.username}</Link>
                                </h1>
                                <span className="text-gray-600 text-sm">{suggestedUser.bio || 'Bio here...'}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
            <ToastContainer /> {/* Add ToastContainer to render the toasts */}
        </div>
    );
};

export default SuggestedUsers;
