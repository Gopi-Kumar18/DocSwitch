import express from 'express';
const router = express.Router();


router.get('/me', (req, res) => {
     console.log('Session in /me:', req.session);
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ user: req.session.user });
});

export default router;