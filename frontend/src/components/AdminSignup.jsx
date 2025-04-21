import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';  // Import eye icons

const AdminSignup = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: "",
        college: "",
        type: "club",  // Set type as "club" for admin
        isAdmin: true  // Set isAdmin as true for admin
    });
    const [showPassword, setShowPassword] = useState(false);  // State to toggle password visibility
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        const { name, value, type, checked } = e.target;
        setInput({
            ...input,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post('https://vitclubs.onrender.com//api/v1/user/register', input, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
                setInput({
                    username: "",
                    email: "",
                    password: "",
                    college: "",
                    type: "club",  // Ensure type remains "club"
                    isAdmin: true  // Ensure isAdmin remains true
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='flex items-center w-screen h-screen justify-center'>
            <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8'>
                <h1 className='text-2xl font-bold'>Admin Registration</h1>
                <div>
                    <label>Username</label>
                    <Input type="text" name="username" value={input.username} onChange={changeEventHandler} />
                </div>
                <div>
                    <label>Email</label>
                    <Input type="email" name="email" value={input.email} onChange={changeEventHandler} />
                </div>
                <div className="relative">
                    <label>Password</label>
                    <Input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        value={input.password} 
                        onChange={changeEventHandler} 
                    />
                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-10 cursor-pointer text-gray-500"
                    >
                        {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </span>
                </div>
                <div>
                    <label>College</label>
                    <Input type="text" name="college" value={input.college} onChange={changeEventHandler} />
                </div>
                <div>
                    <label>Account for</label>
                    <p className="p-2 border rounded bg-gray-100">Club</p>  {/* Display as static text */}
                </div>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register as Admin'}
                </Button>
                <p className="mt-4 text-center">
                    Are you a student?{' '}
                    <span 
                        onClick={() => navigate('/signup')} 
                        className="text-blue-500 cursor-pointer underline"
                    >
                        Go to Student Signup
                    </span>
                </p>
            </form>
        </div>
    );
};

export default AdminSignup;
