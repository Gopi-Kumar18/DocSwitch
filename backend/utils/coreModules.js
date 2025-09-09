import bcrypt from 'bcryptjs';
import CloudConvert from 'cloudconvert';
import jwt from "jsonwebtoken";
import crypto from "crypto";
import multer from "multer";
import axios from 'axios';
import fs from "fs";
import path from "path";

import { fileTypeFromFile } from "file-type";
import { fileTypeFromStream } from 'file-type';
import { fileTypeFromBuffer } from 'file-type';

import { promisify } from "util";
import { generateToken } from "../utils/tokenUtils.js"; 
import { gfsProcessed } from "../config/db.js";
import { allowedMimes } from "../utils/allowedMimes.js";

import FileToken from "../models/FileToken.js";
import mongoose from "mongoose";

import express from "express";
import dotenv from "dotenv";

import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import nodemailer from "nodemailer";

import { PDFDocument } from 'pdf-lib';



export {

  fs,
  crypto,
  CloudConvert,
  path,
  axios,
  dotenv,
  jwt,
  FileToken,
  generateToken,
  fileTypeFromFile,
  promisify,
  fileTypeFromStream,
  fileTypeFromBuffer,
  mongoose,
  express,
  multer,
  gfsProcessed,
  allowedMimes,
  cors,
  helmet,
  rateLimit,
  session,
  MongoStore,
  bcrypt,
  nodemailer,
  PDFDocument
  
};
