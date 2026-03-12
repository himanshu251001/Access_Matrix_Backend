import { getEnforcer } from '../config/casbin.js';
import { Helper } from '../utils/helper.js';

const roleMiddleware = () => async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const role = await Helper.deriveRole(user.grade, user.id);
        req.user.role = role;

        const enforcer = await getEnforcer();
        const method = req.method.toUpperCase();
        const resource = req.path;

        const allowed = await enforcer.enforce(role, resource, method);

        if (!allowed) {
            return res.status(403).json({
                error: 'Forbidden – you do not have permission to perform this action',
            });
        }

        next();
    } catch (err) {
        console.error('Role middleware error:', err);
        next(err);
    }
};

export default roleMiddleware;
