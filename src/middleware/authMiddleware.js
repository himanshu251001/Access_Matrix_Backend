import passport from 'passport';
import '../config/passport.js';

const authMiddleware = passport.authenticate('jwt', { session: false });

export default authMiddleware;