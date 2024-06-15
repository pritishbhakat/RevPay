import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json());
app.use(cookieParser());

// route import 
import authRoutes from "./routes/auth.routes.js";
import accountRoutes from "./routes/account.routes.js";
import transactionsRoutes from "./routes/transactions.routes.js";


// route declaration

app.use("/api/auth", authRoutes);

app.use("/api/accounts", accountRoutes);

app.use("/api/transactions", transactionsRoutes);


// http://localhost:8000/api/auth/login




export { app };

