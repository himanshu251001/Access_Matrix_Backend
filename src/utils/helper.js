import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.ts';

class Helper {
    static generateAccessToken = (user, impersonatedBy = null) => {
        const payload = { id: user.id, grade: user.grade, email: user.email };


        if (impersonatedBy) {
            payload.impersonated_by = impersonatedBy;
            payload.is_impersonation = true;
        }

        return jwt.sign(
            payload,
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN, algorithm: 'HS256' } 
        );
    };

    static generateRefreshToken = (user) => {
        return jwt.sign(
            {
                id: user.id,
                grade: user.grade
            },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN, algorithm: 'HS256' }
        );
    };

    static deriveRole = async (grade, id) => {
        if (!grade) throw new Error('Required grade is missing');

        const prefix = grade.charAt(0).toUpperCase();

        switch (prefix) {
            case 'M':
                return 'manager';
            case 'D':
            case 'P':
                return 'director';
            case 'G':
                const hasSubordinates = await this.getAllSubordinateIds([id]);
                if (hasSubordinates.length > 0) {
                    return 'lead';
                }
                return 'employee';
        }
    };
    static async getAllSubordinateIds(reportToIds) {

        const employees = await prisma.employee.findMany({
            where: {
                report_to_id: { in: reportToIds }
            },
            select: { id: true }
        });

        if (!employees.length) return [];

        const nextIds = employees.map(e => e.id);

        const subIds = await this.getAllSubordinateIds(nextIds);

        return [...new Set([...nextIds, ...subIds])];
    }
}


export { Helper };