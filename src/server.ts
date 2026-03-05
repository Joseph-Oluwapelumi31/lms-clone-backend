import { env } from './config/env.js';
import {app} from './app.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';


async function startServer() {
   await connectDB()
  //  await User.create({
  //   name: "Joseph",
  //   email: "joseph@gmail.com",
  //   password: "123456",
  //   });
  app.listen(env.PORT, () => {
        console.log(`Server is running on port ${env.PORT}`);
    });
}

startServer();