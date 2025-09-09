import { express } from '../utils/coreModules.js';
const router = express.Router();


router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ user: req.session.user });
});


export default router;