import { express } from './utils/coreModules.js';
import { dotenv } from './utils/coreModules.js';
import { connectDB } from './config/db.js';
import { applyMiddlewares } from './middlewares/middlewares.js';

import convertRoutes from './routes/convertRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

await connectDB();

applyMiddlewares(app);


app.use('/', convertRoutes);
app.use('/contact-us', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}\n`);
});



