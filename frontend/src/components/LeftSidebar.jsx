import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp, Bell, Activity } from 'lucide-react'; 
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'; 
import { toast } from 'sonner'; 
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import CreatePost from './CreatePost';

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();

    const logoutHandler = async () => {
        try {
            const res = await axios.get('https://vitclubs.onrender.com//api/v1/user/logout', { withCredentials: true });
            if (res.data.success) {
                dispatch(setAuthUser(null));
                toast.success(res.data.message);
                navigate("/login");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    };

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            logoutHandler();
        } else if (textType === "Create") {
            setOpen(true);
        } else if (textType === "Home") {
            navigate("/");
        }else if (textType === "Profile") {
            navigate(`/profile/${user?._id}`)
        }
        else if(textType === "Messages") {
            navigate(`/chat`);
        }
        else if(textType === "Search") {
            navigate(`/search`);
        }
    };

    const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <MessageCircle />, text: "Messages" },
    ...(user?.isAdmin ? [{ icon: <PlusSquare />, text: "Create" }] : []),  // Show only for admins
    {
        icon: (
            <Avatar className='w-6 h-6'>
                <AvatarImage src={user?.profilepicture} alt="User" />
                <AvatarFallback>{user?.username?.[0]?.toUpperCase() || 'User'}</AvatarFallback>
            </Avatar>
        ),
        text: "Profile"
    },
    { icon: <LogOut />, text: "Logout" }
];

    return (
        <div className='fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen'>
            <div className='flex flex-col'>
                <h1 className='logo-text'>VITCLUBS</h1>
                <div>
                    {
                        sidebarItems.map((item, index) => (
                            <div 
                                key={index} 
                                onClick={() => sidebarHandler(item.text)} 
                                className='flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3'
                            >
                                {item.icon}
                                <span>{item.text}</span>
                            </div>
                        ))
                    }
                </div>
            </div>

            <CreatePost open={open} setOpen={setOpen}/>

            <style jsx>{`
                .logo-text {
                    font-size: 2rem;  
                    font-weight: bold;
                    background: linear-gradient(90deg, #ff6b6b, #feca57, #ff9ff3, #48dbfb, #1dd1a1, #feca57);
                    background-size: 400%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: gradient-animation 8s ease infinite;
                    text-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
                }

                @keyframes gradient-animation {
                    0% {
                        background-position: 0%;
                    }
                    100% {
                        background-position: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default LeftSidebar;
