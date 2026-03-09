import { prisma } from '../src/lib/prisma.ts';
import argon2 from 'argon2';

// Helper to pick a random element
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomSalary = (min, max) => (Math.floor(Math.random() * (max - min + 1)) + min).toFixed(2);
const randomPhone = () => '9' + Math.floor(100000000 + Math.random() * 900000000).toString(); // 10 digit

const firstNamesMale = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua'];
const firstNamesFemale = ['Mary', 'Patricia', 'Linda', 'Barbara', 'Elizabeth', 'Jennifer', 'Maria', 'Susan', 'Margaret', 'Dorothy', 'Lisa', 'Nancy', 'Karen', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];

const locations = ['New York', 'San Francisco', 'Remote', 'London', 'Berlin', 'Tokyo', 'Sydney', 'Toronto', 'Singapore', 'Austin'];
const perfRatings = ['NOT_RATED', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'];
const riskLevels = ['LOW', 'MEDIUM', 'HIGH'];
const potentialLevels = ['UNKNOWN', 'LOW', 'MEDIUM', 'HIGH'];
const allDepartments = ['ENGINEERING', 'FINANCE', 'HR', 'SALES', 'MARKETING', 'PRODUCT', 'OPERATIONS', 'LEGAL'];
const allJobTitles = ['SOFTWARE_ENGINEER', 'SENIOR_ENGINEER', 'TECH_LEAD', 'ENGINEERING_MANAGER', 'DIRECTOR', 'HR_MANAGER', 'FINANCE_MANAGER', 'PRODUCT_MANAGER', 'CEO'];

async function main() {
    console.log('Seeding database with 100+ employees...');

    // We can use a previously generated hash to save time during seeding
    const passwordHash = '$argon2id$v=19$m=65536,t=3,p=4$qzvNlKafso5pcK/dXsSr6g$/CD+ByVT02C1kQPIx4J9LbHL2kIQisk+g4vI7EGrZek';

    let counter = 1;
    const createEmp = async (levelRole, dept, reportToId) => {
        const isMale = Math.random() > 0.5;
        const firstName = isMale ? pickRandom(firstNamesMale) : pickRandom(firstNamesFemale);
        const lastName = pickRandom(lastNames);
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@example.com`;

        const jobTitle = levelRole.title || pickRandom(allJobTitles.filter(t => t !== 'CEO'));
        const grade = pickRandom(levelRole.grades);

        const emp = await prisma.employee.upsert({
            where: { email },
            update: {},
            create: {
                full_name: fullName,
                email: email,
                phone_number: randomPhone(),
                job_title: jobTitle,
                department: dept,
                report_to_id: reportToId,
                grade: grade,
                location: pickRandom(locations),
                emergency_contact_name: pickRandom(firstNamesMale) + ' ' + lastName,
                emergency_contact_phone: randomPhone(),
                salary: randomSalary(levelRole.minSal, levelRole.maxSal),
                performance_rating: pickRandom(perfRatings),
                attrition_risk: pickRandom(riskLevels),
                potential_rating: pickRandom(potentialLevels),
                gender: isMale ? 'Male' : 'Female',
                passwordHash: passwordHash
            }
        });
        counter++;
        return emp;
    };

    // 1. CEO (Exactly 1, report_to_id = null)
    const ceo = await createEmp(
        { title: 'CEO', grades: ['P7'], minSal: 300000, maxSal: 500000 },
        'OPERATIONS',
        null
    );
    console.log('Created CEO');

    // 2. DIRECTORS (8) - One for each department, reporting to CEO
    const directors = [];
    for (const dept of allDepartments) {
        const dir = await createEmp(
            { title: 'DIRECTOR', grades: ['D1', 'D2', 'D3'], minSal: 200000, maxSal: 250000 },
            dept,
            ceo.id
        );
        directors.push(dir);
    }
    console.log(`Created ${directors.length} Directors`);

    // 3. MANAGERS (24) - 3 per director
    const managers = [];
    for (const dir of directors) {
        // Assign domain-specific manager titles if applicable
        let jobTitle = 'ENGINEERING_MANAGER';
        if (dir.department === 'HR') jobTitle = 'HR_MANAGER';
        if (dir.department === 'FINANCE') jobTitle = 'FINANCE_MANAGER';
        if (dir.department === 'PRODUCT') jobTitle = 'PRODUCT_MANAGER';

        for (let i = 0; i < 3; i++) {
            const mgr = await createEmp(
                { title: jobTitle, grades: ['M1', 'M2', 'M3'], minSal: 140000, maxSal: 190000 },
                dir.department,
                dir.id
            );
            managers.push(mgr);
        }
    }
    console.log(`Created ${managers.length} Managers`);

    // 4. SENIOR STAFF (35) - reporting to Managers
    const seniorStaff = [];
    for (let i = 0; i < 35; i++) {
        const mgr = pickRandom(managers);
        let title = Math.random() > 0.5 ? 'SENIOR_ENGINEER' : 'TECH_LEAD';
        const stf = await createEmp(
            { title, grades: ['G4', 'G5', 'G6', 'G7', 'G8'], minSal: 110000, maxSal: 140000 },
            mgr.department,
            mgr.id
        );
        seniorStaff.push(stf);
    }
    console.log(`Created ${seniorStaff.length} Senior Staff`);

    // 5. REGULAR STAFF (60) - reporting to Managers or Senior Staff
    for (let i = 0; i < 60; i++) {
        const reportTo = Math.random() > 0.6 ? pickRandom(managers) : pickRandom(seniorStaff);
        await createEmp(
            { title: 'SOFTWARE_ENGINEER', grades: ['G1', 'G2', 'G3'], minSal: 80000, maxSal: 105000 },
            reportTo.department,
            reportTo.id
        );
    }
    console.log(`Created 60 Regular Staff`);

    console.log(`Successfully generated ${counter - 1} employees. All possible scenarios included!`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Error during seeding:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
