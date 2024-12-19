import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuthenticated: false,
        userProfile: null,
        suggestedUsers: [],
        selectedUser: null, // Use singular selectedUser for consistency
    },
    reducers: {
        setAuthUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
        },
        setSuggestedUsers: (state, action) => {
            state.suggestedUsers = action.payload;
        },
        setSelectedUser: (state, action) => { // Use singular selectedUser
            state.selectedUser = action.payload;
        },
    }
});

export const { setAuthUser, setUserProfile, setSuggestedUsers, setSelectedUser } = authSlice.actions;
export default authSlice.reducer;
