import { prisma } from '../lib/prisma.ts';
import { Helper } from '../utils/helper.js';
import { employeeSelect, managerSelect, directorSelect } from '../models/db.js';

class EmployeeController {

    static async getAvailableViews(req, res, next) {
        try {
            const reqUser = req.user;
            const role = Helper.deriveRole(reqUser.grade);
            const department = reqUser.department;
            if (role === 'employee') {
                return res.json({ data: { views: ['employee'], department } });
            }
            if (role === 'manager') {
                return res.json({ data: { views: ['employee', 'manager'], department } });
            }
            if (role === 'director') {
                return res.json({ data: { views: ['employee', 'manager', 'director'], department } });
            }

        } catch (err) {
            next(err);
        }
    }

    static async getEmployeeProfile(req, res, next) {
        try {
            const reqUser = req.user;
            const targetEmployeeId = req.params.id;
            const role = Helper.deriveRole(reqUser.grade);
            const viewSelect = role === 'employee' ? employeeSelect : role === 'manager' ? managerSelect : directorSelect;

            const employee = await prisma.employee.findUnique({
                where: { id: targetEmployeeId },
                select: viewSelect
            });

            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }

            return res.json({ data: employee });

        } catch (err) {
            next(err);
        }
    }

    static async getProfile(req, res, next) {
        try {
            const reqUser = req.user
            const role = Helper.deriveRole(reqUser.grade);
            const viewSelect = role === 'employee' ? employeeSelect : role === 'manager' ? managerSelect : directorSelect;

            const employee = await prisma.employee.findUnique({
                where: { id: reqUser.id },
                select: viewSelect
            });
            employee.role = role;

            if (!employee) {
                return res.status(404).json({ error: 'Employee not found' });
            }

            return res.json({ data: employee });

        } catch (err) {
            next(err);
        }
    }
}

export { EmployeeController };
