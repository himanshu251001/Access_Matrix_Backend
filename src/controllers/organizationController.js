import { prisma } from '../lib/prisma.ts';
import { employeeSelect, managerSelect, directorSelect } from '../models/db.js';


export async function getAllRecords(req, res, next) {
    try {
        const viewType = req.query.view;
        const reqUser = req.user;

        if (!['employee', 'manager', 'director'].includes(viewType)) {
            return res.status(400).json({ error: 'Invalid view type. Must be employee, manager, or director.' });
        }

        if (viewType === 'employee') {
            const employees = await prisma.employee.findMany({
                select: employeeSelect,
                orderBy: { id: 'desc' }
            });
            return res.json({ data: employees });
        }


        if (viewType === 'manager' || viewType === 'director') {
            const allEmployeesIds = await getAllSubordinateIds([reqUser.id]);

            if (!allEmployeesIds.length) {
                return res.json({ data: [] });
            }

            const viewSelect = viewType === 'manager' ? managerSelect : directorSelect;
            const allEmployees = await getAllSubordinates(allEmployeesIds, viewSelect);
            return res.json({ data: allEmployees });
        }

    } catch (err) {
        next(err);
    }
}
async function getAllSubordinateIds(reportToIds) {

    const employees = await prisma.employee.findMany({
        where: {
            report_to_id: { in: reportToIds }
        },
        select: { id: true }
    });

    if (!employees.length) return [];

    const nextIds = employees.map(e => e.id);

    const subIds = await getAllSubordinateIds(nextIds);

    return [...new Set([...nextIds, ...subIds])];
}

async function getAllSubordinates(ids, viewSelect) {

    if (!ids.length) return [];

    const employees = await prisma.employee.findMany({
        where: {
            id: { in: ids }
        },
        select: viewSelect,
        orderBy: { id: 'desc' }
    });

    return employees;
}
