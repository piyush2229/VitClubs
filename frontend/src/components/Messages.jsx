import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetAllMessage from '@/hooks/useGetAllMessage'
import useGetRTM from '@/hooks/useGetRTM'

const Messages = ({ selectedUser }) => {
    useGetRTM();
    useGetAllMessage();
    const { messages } = useSelector(store => store.chat);
    const { user } = useSelector(store => store.auth);

    return (
        <div className='overflow-y-auto flex-1 p-4'>
            <div className='flex justify-center'>
                <div className='flex flex-col items-center justify-center'>
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={selectedUser?.profilepicture} alt='profile' />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span>{selectedUser?.username}</span>
                    <Link to={`/profile/${selectedUser?._id}`}>
                        <Button className="h-8 my-2" variant="secondary">View profile</Button>
                    </Link>
                </div>
            </div>
            <div className='flex flex-col gap-3 mt-4'>
                {messages && messages.map((msg) => {
                    return (
                        <div key={msg._id} className={`flex ${msg.senderId === user?._id ? 'justify-end' : 'justify-start'} items-center`}>
                            {/* Message Indicator */}
                            <div className={`w-2 h-2 rounded-full ${msg.senderId === user?._id ? 'bg-yellow-500' : 'bg-red-500'} mr-2`} />
                            
                            {/* Message Content */}
                            <div className={`p-2 rounded-lg max-w-xs break-words ${msg.senderId === user?._id ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}`}>
                                {msg.message}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Messages;
