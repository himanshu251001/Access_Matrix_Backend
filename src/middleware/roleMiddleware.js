import { getEnforcer } from '../config/casbin.js';
import { Helper } from '../utils/helper.js';

const roleMiddleware = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const role = Helper.deriveRole(user.grade);
        req.user.role = role;

        const enforcer = await getEnforcer();

        const viewType = req.query.view;
        const method = req.method.toUpperCase();
        let allowed = false;

        if (viewType) {
            const viewResource = `${viewType}:view`;
            allowed = await enforcer.enforce(role, viewResource, method);
        } else {
            return res.status(400).json({ error: 'Required view type is missing' });
        }

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
