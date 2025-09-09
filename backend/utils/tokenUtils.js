
import { jwt } from '../utils/coreModules.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const generateToken = (encodedFilePath, clientIp) => {
  return jwt.sign(
    { file: encodedFilePath, ip: clientIp },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '15m' }
  );
};

export const verifyDownloadToken = (token, clientIp) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });
    if (decoded.ip !== clientIp) return null;
    return decoded;
  } catch (err) {
    return null;
  }
};