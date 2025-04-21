import { setUserProfile } from "@/redux/authSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await axios.get(`https://vitclubs.onrender.com/api/v1/user/${userId}/profile`, { withCredentials: true });
                console.log("Response from API:", res.data);  // Log the response data here
                if (res.data.success) {
                    dispatch(setUserProfile(res.data.user));
                }
            } catch (error) {
                console.log("Error fetching profile:", error);  // Log error if any
            }
        };

        if (userId) {
            fetchUserProfile();
        }
    }, [dispatch, userId]); // Adding dispatch as a dependency to avoid stale closures
};

export default useGetUserProfile;

