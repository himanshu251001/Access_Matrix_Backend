
import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';
import cors from "cors";


const loggerMiddleware = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};  

const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// app.use(loggerMiddleware);
app.use('/auth', authRoutes);
app.use(authMiddleware);

app.use('/api/employee', employeeRoutes);
app.use('/api/organization', organizationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
