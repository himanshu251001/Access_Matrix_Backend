
import argon2 from 'argon2';
import { Helper } from '../utils/helper.js';
import { prisma } from '../lib/prisma.ts';
import jwt from 'jsonwebtoken';


const loginHandler = async (req, res) => {
    try {
        const { email, password } = req.body;

        const employee = await prisma.employee.findUnique({ where: { email } });


        if (!employee) {
            return res.status(400).json({ message: "Employee not found" });
        }

        const isMatch = await argon2.verify(employee.passwordHash, password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const accessToken = Helper.generateAccessToken(employee);
        const refreshToken = Helper.generateRefreshToken(employee);

        await prisma.employee.update({
            where: { id: employee.id },
            data: { refreshToken }
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            accessToken
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const refreshTokenHandler = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
        return res.status(401).json({ message: "No refresh token provided" });
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const userId = decoded.id;

        const employee = await prisma.employee.findUnique({ where: { id: userId } });
        if (!employee)
            return res.status(403).json({ message: "Invalid refresh token" });

        const isMatch = employee.refreshToken === refreshToken;
        if (!isMatch)
            return res.status(403).json({ message: "Invalid refresh token" });

        const newAccessToken = Helper.generateAccessToken(employee);

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        res.status(403).json({ message: "Invalid refresh token" });
    }
};

const logoutHandler = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(204).send();
        }
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const userId = decoded.id;

        await prisma.employee.update({
            where: { id: userId },
            data: { refreshToken: null }
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false,
            sameSite: 'strict'
        });

        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.clearCookie('refreshToken');
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
};

const impersonateHandler = async (req, res) => {
    try {
        const admin = req.user;

        if (!admin.isAdmin || admin.is_impersonation) {
            return res.status(403).json({ message: 'Forbidden – admin privileges required and nested impersonation is not allowed' });
        }

        const { targetUserId } = req.body;
        if (!targetUserId) {
            return res.status(400).json({ message: 'targetId is required' });
        }

        if (admin.id === targetUserId) {
            return res.status(400).json({ message: 'Self impersonation is not allowed' });
        }

        const target = await prisma.employee.findUnique({ where: { id: targetUserId } });
        if (!target) {
            return res.status(404).json({ message: 'Target employee not found' });
        }

        await prisma.auditLog.create({
            data: {
                action: 'IMPERSONATE',
                actorId: admin.id,
                targetId: target.id,
                metadata: { adminEmail: admin.email, targetEmail: target.email }
            }
        });

        const targetAccessToken = Helper.generateAccessToken(target, admin.id);


        res.status(200).json({
            success: true,
            accessToken: targetAccessToken,
            impersonating: {
                id: target.id,
                email: target.email,
                full_name: target.full_name
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const stopImpersonationHandler = async (req, res) => {
    try {
        if (!req.user || !req.user.is_impersonation) {
            return res.status(400).json({ message: 'No active impersonation session found to revert' });
        }

        const adminId = req.user.impersonated_by;
        const targetId = req.user.id;

        const admin = await prisma.employee.findUnique({ where: { id: adminId } });
        if (!admin || !admin.isAdmin) {
            return res.status(403).json({ message: 'Original admin not found or lacks privileges' });
        }
        // Log revert
        await prisma.auditLog.create({
            data: {
                action: 'REVERT_IMPERSONATE',
                actorId: admin.id,
                targetId: targetId,
                metadata: { adminEmail: admin.email, targetEmail: req.user.email }
            }
        });
        
        const freshAccessToken = Helper.generateAccessToken(admin);
     

        res.status(200).json({
            success: true,
            accessToken: freshAccessToken,
            message: 'Impersonation reverted successfully. Token refreshed for Admin.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default {
    loginHandler,
    refreshTokenHandler,
    logoutHandler,
    impersonateHandler,
    stopImpersonationHandler
};