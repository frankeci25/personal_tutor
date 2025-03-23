require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI 
const jwtSecret = process.env.JWT_SECRET || "4934bc985549d2dd61bf91ceb063094bad6a90747b4878860ad6eef45e96ba30181e8a28cdbbb9efd305bacbed444bf2b513237e7855f60ec0d4c4f76ea2b4d8"
const env = process.env.NODE_ENV || 'development'
const port = process.env.PORT || 5000
module.exports = {
  MONGODB_URI,
  jwtSecret,
  port
}