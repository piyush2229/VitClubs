import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postroute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./socket/socket.js";
import path from "path";

dotenv.config();

// Server port
const PORT = process.env.PORT || 3001;

// Resolve __dirname for ES Modules
const __dirname = path.resolve();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
};
app.use(cors(corsOptions));


app.use("/", (req, res) => {
    res.send("Hello from the server!");
});

// API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postroute);
app.use("/api/v1/message", messageRoute);

// Static file serving (for production only)
// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(__dirname, "frontend", "dist")));
//     app.get("*", (req, res) => {
//         res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
//     });
// }

// Replace the production static file serving section with this:

// if (process.env.NODE_ENV === "production") {
//     // Go up one level from backend directory to project root, then into frontend/dist
//     const frontendPath = path.join(__dirname, "..", "frontend", "dist");
    
//     app.use(express.static(frontendPath));
    
//     app.get("*", (req, res) => {
//         res.sendFile(path.join(frontendPath, "index.html"), (err) => {
//             if (err) {
//                 console.error("Error sending file:", err);
//                 res.status(500).send("Internal Server Error");
//             }
//         });
//     });
// }

// Catch-all route for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});


// Connect to database and start server
connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to database", error);
    });
