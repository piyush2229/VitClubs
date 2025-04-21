import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser } from '@/redux/authSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessageCircleCode } from 'lucide-react';
import Messages from './Messages';
import axios from 'axios';
import { setMessages } from '@/redux/chatSlice';
import { useNavigate } from 'react-router-dom'; // ✅ added

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user, suggestedUsers, selectedUser } = useSelector((store) => store.auth);
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  
  const dispatch = useDispatch();
  const navigate = useNavigate(); 

  const sendMessageHandler = async (receiverId) => {
    try {
      const res = await axios.post(
        `https://vitclubs.onrender.com/api/v1/message/send/${receiverId}`,
        { textMessage },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setTextMessage('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      axios
        .get(`http://localhost:8001/api/v1/message/${selectedUser?._id}`, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.data.success) {
            dispatch(setMessages(res.data.messages));
          }
        })
        .catch((error) => console.log(error));
    }
  }, [selectedUser, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, [dispatch]);

  // Filter suggested users based on the search query
  const filteredUsers = suggestedUsers.filter((suggestedUser) =>
    suggestedUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort messages in reverse order (most recent first)
  const sortedMessages = [...messages].reverse();

  return (
    <div className='flex ml-[16%] h-screen'>
      <section className='w-full md:w-1/4 my-8'>
        <h1 className='font-bold mb-4 px-3 text-xl'>{user?.username}</h1>
        <hr className='mb-4 border-gray-300' />
        
        {/* Search Input for filtering users */}
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          type='text'
          className='mb-4 p-2 border rounded-md w-full'
          placeholder='Search Users...'
        />
        
        <div className='overflow-y-auto h-[80vh]'>
          {filteredUsers.map((suggestedUser) => {
            const isOnline = onlineUsers.includes(suggestedUser?._id);
            return (
              <div
                key={suggestedUser._id}
                onClick={() => {
                  dispatch(setSelectedUser(suggestedUser)); 
                  navigate('/chat'); 
                }}
                className='flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer'
              >
                <Avatar className='w-14 h-14'>
                  <AvatarImage src={suggestedUser?.profilepicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                  <span className='font-medium'>{suggestedUser?.username}</span>
                  <span className={`text-xs font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {isOnline ? 'online' : 'offline'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedUser ? (
        <section className='flex-1 border-l border-l-gray-300 flex flex-col h-full'>
          <div className='flex gap-3 items-center px-3 py-2 border-b border-gray-300 sticky top-0 bg-white z-10'>
            <Avatar>
              <AvatarImage src={selectedUser?.profilepicture} alt='profile' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <span>{selectedUser?.username}</span>
            </div>
          </div>
          <Messages selectedUser={selectedUser} messages={sortedMessages} />
          <div className='flex items-center p-4 border-t border-t-gray-300'>
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              type='text'
              className='flex-1 mr-2 focus-visible:ring-transparent'
              placeholder='Messages...'
            />
            <Button onClick={() => sendMessageHandler(selectedUser?._id)}>Send</Button>
          </div>
        </section>
      ) : (
        <div className='flex flex-col items-center justify-center mx-auto'>
          <MessageCircleCode className='w-32 h-32 my-4' />
          <h1 className='font-medium'>Your messages</h1>
          <span>Send a message to start a chat.</span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
