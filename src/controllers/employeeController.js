import { prisma } from '../lib/prisma.ts';
import { employeeSelect, managerSelect, directorSelect } from '../models/db.js';

class EmployeeController {

    static async getAvailableViews(req, res, next) {
        try {
            const reqUser = req.user;
            const role = reqUser.role;
            const department = reqUser.department;
            if (role === 'employee') {
                return res.json({ data: { views: [''], department } });
            }
            if (role === 'manager' || role === 'lead' || role === 'director') {
                return res.json({ data: { views: ['teams'], department } });
            }

        } catch (err) {
            next(err);
        }
    }

    // static async getEmployeeProfile(req, res, next) {
    //     try {
    //         const reqUser = req.user;
    //         const targetEmployeeId = req.params.id;
    //         const role = req.user.role;
    //         const viewSelect = role === 'employee' ? employeeSelect : role === 'manager' ? managerSelect : directorSelect;

    //         const employee = await prisma.employee.findUnique({
    //             where: { id: targetEmployeeId },
    //             select: viewSelect
    //         });

    //         if (!employee) {
    //             return res.status(404).json({ error: 'Employee not found' });
    //         }

    //         return res.json({ data: employee });

    //     } catch (err) {
    //         next(err);
    //     }
    // }

    static async getProfile(req, res, next) {
        try {
            const reqUser = req.user
            const role = reqUser.role;
            const baseSelect = role === 'employee' ? employeeSelect : role === 'manager' ? managerSelect : directorSelect;
            const viewSelect = { ...baseSelect, isAdmin: true };
            const employee = await prisma.employee.findUnique({
                where: { id: reqUser.id },
                select: viewSelect
            });
            employee.role = role;
            employee.isImpersonation = reqUser.is_impersonation;
            employee.impersonatedBy = reqUser.impersonated_by;
            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }

            return res.json({ data: employee });

        } catch (err) {
            next(err);
        }
    }

    static async searchEmployees(req, res, next) {
        try {
            const { value } = req.query;

            let whereClause = {};

            if (value) {
                const orConditions = [
                    {
                        full_name: {
                            contains: value,
                            mode: "insensitive"
                        }
                    },
                    {
                        email: {
                            contains: value,
                            mode: "insensitive"
                        }
                    },
                    {
                        location: {
                            contains: value,
                            mode: "insensitive"
                        }
                    }
                ];

                // If value is a number, search by id
                const numericValue = parseInt(value);
                if (!isNaN(numericValue)) {
                    orConditions.push({ id: numericValue });
                }

                const upperValue = value.toUpperCase().replace(/\s+/g, '_');

                const validDepartments = ['ENGINEERING', 'FINANCE', 'HR', 'SALES', 'MARKETING', 'PRODUCT', 'OPERATIONS', 'LEGAL'];
                if (validDepartments.some(dept => dept.includes(upperValue))) {
                    validDepartments.forEach(dept => {
                        if (dept.includes(upperValue)) {
                            orConditions.push({ department: dept });
                        }
                    });
                }

                const validGrades = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'];
                if (validGrades.some(grade => grade.includes(upperValue))) {
                    validGrades.forEach(grade => {
                        if (grade.includes(upperValue)) {
                            orConditions.push({ grade: grade });
                        }
                    });
                }

                whereClause = { OR: orConditions };
            }

            const employees = await prisma.employee.findMany({
                where: whereClause,
                select: employeeSelect
            });

            res.json({ data: employees });

        } catch (err) {
            next(err);
        }
    }
}

export { EmployeeController };
