import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
    name: "socketio",
    initialState: {
        socket: null
    },
    reducers: {
        setSocket: (state, action) => {
            state.socket = action.payload;
        },
        disconnectSocket: (state) => {
            // Reset the socket connection in the state
            if (state.socket) {
                state.socket.disconnect();
            }
            state.socket = null;
        }
    }
});

// Export actions to use in components
export const { setSocket, disconnectSocket } = socketSlice.actions;
export default socketSlice.reducer;
