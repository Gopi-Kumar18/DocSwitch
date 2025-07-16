import { express } from '../utils/coreModules.js';
import User from '../models/User.js';

const app = express();

const router = express.Router();

app.use(express.json());

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
     console.log('Login request received');
 
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = {
      id: user._id,
      name: user.name,
    };

    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ message: 'Login successful' });
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  //  console.log('Session after login:', req.session);
});


router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

export default router;
