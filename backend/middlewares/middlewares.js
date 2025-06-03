
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo'; 
import dotenv from 'dotenv';

dotenv.config();

export const applyMiddlewares = (app) => { 

  app.use(helmet());

   app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
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
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, 
    httpOnly: true,
    sameSite: 'lax',
    secure: false 
  }
}));

};


