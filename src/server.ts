import { env } from './config/env.js';
import {app} from './app.js';
import { connectDB } from './config/db.js';

async function startServer() {
   await connectDB()
  
  app.listen(env.PORT, () => {
        console.log(`Server is running on port ${env.PORT}`);
    });
}

startServer();