import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Star } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { setAuthUser, setSelectedUser } from '@/redux/authSlice';
import axios from 'axios';
import { toast } from 'sonner';

const Profile = () => {
  const params = useParams();
  const userId = params.id;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(false);
  const { userProfile, user } = useSelector((store) => store.auth);

  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const [isUserFollowing, setIsUserFollowing] = useState(false);

  useGetUserProfile(userId);

  useEffect(() => {
    if (userProfile && user) {
      setIsUserFollowing(userProfile?.followers?.includes(user._id));
    }
  }, [userProfile, user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  const editProfileHandler = async () => {
    const formData = new FormData();
    formData.append("bio", input.bio);
    formData.append("gender", input.gender);
    formData.append("college", user?.college);
    formData.append("club", input.club);

    if (input.profilePhoto) {
      formData.append("profilePhoto", input.profilePhoto);
    }

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:8001/api/v1/user/profile/edit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (res.data.success) {
        const updatedUserData = {
          ...user,
          bio: res.data.user?.bio,
          profilePicture: res.data.user?.profilePicture,
          gender: res.data.user?.gender,
          club: res.data.user?.club,
          college: res.data.user?.college,
        };

        dispatch(setAuthUser(updatedUserData));
        navigate(`/profile/${user?._id}`);
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    setIsUserFollowing(!isUserFollowing);

    try {
      const res = await axios.post(`https://vitclubs.onrender.com/api/v1/user/followorunfollow/${userProfile?._id}`, {}, { withCredentials: true });
      if (res.data.success) {
        if (isUserFollowing) {
          dispatch(setAuthUser({
            ...user,
            following: user.following.filter(followingId => followingId !== userProfile?._id),
          }));
        } else {
          dispatch(setAuthUser({
            ...user,
            following: [...user.following, userProfile?._id],
          }));
        }
        toast.success(res.data.message);

        setTimeout(() => {
          window.location.reload();
        }, 400);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Something went wrong. Please try again.');
      setIsUserFollowing(isUserFollowing);
    }
  };

  const handleMessageClick = () => {
    dispatch(setSelectedUser(userProfile)); 
    setTimeout(() => {
      navigate('/chat'); 
    }, 100); // slight delay to allow Redux state update
  };
  

  return (
    <div className="flex max-w-5xl justify-center mx-auto pl-10">
      <div className="flex flex-col gap-20 p-8">
        <div className="grid grid-cols-2">
          <section className="flex items-center justify-center">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={userProfile?.profilepicture}
                alt="profilephoto"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span>{userProfile?.username}</span>
                {userProfile?.isAdmin && (
                  <div className="flex items-center bg-yellow-500 text-white p-1 rounded-md">
                    <Star className="mr-2" size={20} />
                    <span>Club</span>
                  </div>
                )}
                {isLoggedInUserProfile ? (
                  <Button 
                    variant="secondary" 
                    className="hover:bg-gray-200 h-8"
                    onClick={() => navigate(`/account/edit`)}
                  >
                    {loading ? 'Saving...' : 'Edit Profile'}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      className={`h-8 ${isUserFollowing ? 'bg-red-500' : 'bg-[#0095F6]'} hover:bg-[#3192d2]`}
                      onClick={handleFollowToggle}
                    >
                      {isUserFollowing ? 'Unsubscribe' : 'Subscribe'}
                    </Button>
                    <Button 
                      className="h-8 bg-green-600 hover:bg-green-700"
                      onClick={handleMessageClick}
                    >
                      Message
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <p>
                  <span className="font-semibold">{userProfile?.posts?.length} </span>
                  Posts
                </p>
                <p>
                  <span className="font-semibold">{userProfile?.followers?.length} </span>
                  Followers
                </p>
                <p>
                  <span className="font-semibold">{userProfile?.following?.length} </span>
                  Following
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">
                  {userProfile?.bio || 'bio here...'}
                </span>
                <Badge className="w-fit" variant="secondary">
                  <AtSign /> <span className="pl-1">{userProfile?.username}</span>
                </Badge>
              </div>
            </div>
          </section>
        </div>
        <div className="border-t border-t-gray-200">
          <div className="flex items-center justify-center gap-10 text-sm">
            <span
              className={`py-3 cursor-pointer ${activeTab === 'posts' ? 'font-bold' : ''}`}
              onClick={() => handleTabChange('posts')}
            >
              POSTS
            </span>
            <span
              className={`py-3 cursor-pointer ${activeTab === 'saved' ? 'font-bold' : ''}`}
              onClick={() => handleTabChange('saved')}
            >
              SAVED
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {displayedPost?.length > 0 ? (
              displayedPost.map((post) => (
                <div key={post?._id} className="relative group cursor-pointer">
                  <img
                    src={post.image || '/path/to/placeholder.jpg'}
                    alt="postimage"
                    className="rounded-sm my-2 w-full aspect-square object-cover"
                  />
                </div>
              ))
            ) : (
              <p>No {activeTab === 'posts' ? 'posts' : 'saved items'} found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
