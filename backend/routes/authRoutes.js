
import { express, dotenv, crypto, nodemailer} from '../utils/coreModules.js'

import User from '../models/User.js';

dotenv.config();

const router = express.Router();

router.use(express.json());

// ———————————————— SMTP transporter setup ————————————————————————————
 
let transporter;
if (
  process.env.EMAIL_HOST &&
  process.env.EMAIL_PORT &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS
) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  console.warn('⚠️  SMTP settings are missing—emails will not be sent.');
}


// ————————————————— SIGN UP ————————————————————————————

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


// ——————————————— LOG IN ——————————————————————————————

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = { id: user._id, name: user.name };
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
});


// ————————————————————— FORGOT PASSWORD (using reset link) ————————————————————————

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: 'No account with that email' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken   = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    if (!transporter) {
      console.warn('⚠️  No transporter—skipping email send');
      return res.json({ message: 'Reset token generated (no email sent).' });
    }

    const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password/${token}`;
    const mailOptions = {
      from: `"DocSwitch Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your DocSwitch Password Reset Link',
      text: `
Hi ${user.name},

You requested a password reset. Click the link below to reset your password. This link expires in one hour:

${resetUrl}

If you didn’t request this, please contact us at ${process.env.EMAIL_USER}.

— DocSwitch Team
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ————————————————— RESET PASSWORD (token-based) ———————————————————————————

router.post('/reset-password/:token', async (req, res) => {
  const { token }    = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password is required.' });

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ error: 'Token is invalid or expired.' });
    }

  
    user.password              = password;
    user.resetPasswordToken    = undefined;
    user.resetPasswordExpires  = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset-password error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});


// —————————————————  LOG OUT  ———————————————————————————

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

export default router;
