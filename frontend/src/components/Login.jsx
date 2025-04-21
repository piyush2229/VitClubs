import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react'; // Import eye icons
import { useDispatch } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post('https://vitclubs.onrender.com//api/v1/user/login', input, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
                setInput({ email: "", password: "" });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex items-center w-screen h-screen justify-center'>
            <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8'>
                <div className='my-4'>
                    <h1 className='logo-text'>VITCLUBS</h1>
                    <p className='text-sm text-center'>Login to Your Credentials</p>
                </div>
                <div>
                    <span className='font-medium'>Email</span>
                    <Input
                        type="email"
                        name="email"
                        value={input.email}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2"
                    />
                </div>
                <div className="relative">
                    <span className='font-medium'>Password</span>
                    <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2 pr-10" // Add padding for icon
                        autoComplete="current-password"
                    />
                    {/* Toggle visibility icon */}
                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 cursor-pointer"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </span>
                </div>
                {loading ? (
                    <Button>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Please wait
                    </Button>
                ) : (
                    <Button type='submit'>Login</Button>
                )}
                <span className='text-center'>
                    Doesn't have an account? <Link to="/signup" className='text-blue-600'>Register</Link>
                </span>
            </form>

            {/* Inline CSS Styling for the Logo */}
            <style jsx>{`
                .logo-text {
                    font-size: 3rem;
                    font-weight: bold;
                    text-align: center;
                    background: linear-gradient(90deg, #ff6b6b, #feca57, #ff9ff3, #48dbfb, #1dd1a1, #feca57);
                    background-size: 400%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: gradient-animation 8s ease infinite;
                    text-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
                }
                @keyframes gradient-animation {
                    0% { background-position: 0%; }
                    100% { background-position: 100%; }
                }
            `}</style>
        </div>
    );
}

export default Login;
