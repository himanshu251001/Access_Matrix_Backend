import jwt from 'jsonwebtoken';

class Helper {
    static generateAccessToken = (user) => {
        return jwt.sign(
            { id: user.id, grade: user.grade, email: user.email, grade: user.grade }, //payload 
            process.env.JWT_SECRET, //secret key
            { expiresIn: process.env.JWT_EXPIRES_IN, algorithm: 'HS256' } //options
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

    static deriveRole = (grade) => {
        if (!grade) throw new Error('Required grade is missing');

        const prefix = grade.charAt(0).toUpperCase();

        switch (prefix) {
            case 'M':
                return 'manager';
            case 'D':
            case 'P':
                return 'director';
            case 'G':
                return 'employee';
        }
    };
}


export { Helper };