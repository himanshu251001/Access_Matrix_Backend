import { prisma } from '../lib/prisma.ts';
import { employeeSelect, managerSelect, directorSelect } from '../models/db.js';


export async function getAllRecords(req, res, next) {
    try {
        const employees = await prisma.employee.findMany({
            select: employeeSelect,
            orderBy: { id: 'desc' }
        });
        return res.json({ data: employees });


    } catch (err) {
        next(err);
    }
}

export async function getTeams(req, res, next) {
    try {
        const reqUser = req.user;
        const role = reqUser.role;

        if (role === 'manager' || role === 'director' || role === 'lead') {
            const allEmployeesIds = await getAllSubordinateIds([reqUser.id]);

            if (!allEmployeesIds.length) {
                return res.json({ data: [] });
            }

            const viewSelect = role === 'lead' ? employeeSelect: role === 'manager' ? managerSelect : directorSelect;
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
