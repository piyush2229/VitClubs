import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react'; // Ensure Loader2 is imported

const Signup = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: "",
        college: ""  // Added college field to the input state
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const signupHandler = async (e) => {
        e.preventDefault();
        console.log(input);
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8001/api/v1/user/register', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                navigate("/login");
                toast.success(res.data.message);
                setInput({
                    username: "",
                    email: "",
                    password: "",
                    college: ""  // Reset college field
                });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    // Handle navigation to the Admin Signup page (for clubs)
    const handleClubSignup = () => {
        navigate("/admin/signup");
    }

    return (
        <div className='flex items-center w-screen h-screen justify-center'>
            <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8'>
                <div className='my-4'>
                    <h1 className='logo-text'>VITCLUBS</h1>
                    <p className='text-sm text-center'>Join us to know about the Clubs and their events!</p>
                </div>
                <div>
                    <span className='font-medium'>Username</span>
                    <Input
                        type="text"
                        name="username"
                        value={input.username}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2"
                    />
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
                <div>
                    <span className='font-medium'>Password</span>
                    <Input
                        type="password"
                        name="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2"
                        autoComplete="current-password"  // Added autoComplete attribute
                    />
                </div>
                <div>
                    <span className='font-medium'>College</span> {/* Added label for college */}
                    <Input
                        type="text"
                        name="college"
                        value={input.college}
                        onChange={changeEventHandler}  // Change handler for college
                        className="focus-visible:ring-transparent my-2"
                    />
                </div>
                
                {
                    loading ? (
                        <Button>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Please wait
                        </Button>
                    ) : (
                        <Button type='submit'>Signup</Button>
                    )
                }

                <div className="text-center">
                    <span>Already have an account? <Link to="/login" className='text-blue-600'>Login</Link></span>
                </div>

                {/* Link for "Are you a club?" to redirect to the admin signup */}
                <div className="text-center mt-">
                    <span>Are you a club? <button onClick={handleClubSignup} className="text-blue-600">Sign up as a club</button></span>
                </div>
            </form>

            {/* Inline CSS Styling for the Logo */}
            <style jsx>{`
                .logo-text {
                    font-size: 3rem;  /* Large size for logo effect */
                    font-weight: bold;
                    text-align: center;
                    background: linear-gradient(90deg, #ff6b6b, #feca57, #ff9ff3, #48dbfb, #1dd1a1, #feca57);
                    background-size: 400%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: gradient-animation 8s ease infinite;
                    text-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
                }

                /* Animation for moving gradient */
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
}

export default Signup;
