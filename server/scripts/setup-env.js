const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const rootDir = path.resolve(__dirname, '..');

// Copy server environment file
const serverEnvFile = path.join(rootDir, `.env.${env}`);
const serverEnvDest = path.join(rootDir, '.env');
//check if file exists
if (!fs.existsSync(serverEnvFile)) {
    //create empty file
    fs.writeFileSync(serverEnvFile, '');
}
fs.copyFileSync(serverEnvFile, serverEnvDest);