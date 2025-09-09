import { cors,helmet,rateLimit,express,session,MongoStore,dotenv } from '../utils/coreModules.js'

dotenv.config();

export const applyMiddlewares = (app) => { 

  app.use(helmet());

   app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
    // origin: process.env.SECURE_CLIENT_ORIGIN,
    credentials: true,
  }));

    
  app.use(express.json());

  const limiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 50,
    message: "Too many requests, please try again later."
  });
  app.use(limiter);

  
  app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 10, 
    httpOnly: true,
    sameSite: 'lax',
    secure: false 
  }
}));

};


