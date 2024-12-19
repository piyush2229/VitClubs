// Import modules
import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"; // Correct import for dotenv
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postroute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import {app,server} from "./socket/socket.js"
import path from "path";
// Load environment variables
dotenv.config(); // Load .env file



// Server port
const PORT = process.env.PORT || 3001; // Use PORT from .env or default to 3000

const __dirname = path.resolve();
console.log(__dirname);

// Middlewares
app.use(express.json()); // Parse JSON data
app.use(cookieParser()); // Parse cookies
app.use(urlencoded({ extended: true })); // Parse URL-encoded data




// CORS configuration
const corsOptions = {
    origin: 'http://localhost:5173', // Allow this origin
    credentials: true // Allow credentials
};

// Apply CORS middleware
app.use(cors(corsOptions));


// api routes

app.use("/api/v1/user",userRoute);
app.use("/api/v1/post",postroute);
app.use("/api/v1/message",messageRoute);

// Define root route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "I'm coming from the backend",
        success: true
    });
});

// Connect to database and start server
connectDB() // Connect to MongoDB
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to database", error);
    });
