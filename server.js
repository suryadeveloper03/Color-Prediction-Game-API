import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import morgan from 'morgan'
import connectDB from './config/db.js'
import bodyParser from 'body-parser'
import cors from 'cors'
import cron from 'node-cron'
import mobileRoutes from './mobile/routes/mobileRoutes.js'
import adminRoutes from './admin/routes/adminRoutes.js'
import handlebars from 'handlebars'
import * as fs from 'fs';
import { baseUrl, emailTempletsDir } from './config/constant.js'
import { commonSendMail, readHTMLFile, createEmailFile, adminEmail } from './config/mail.js'

/* ================================================== 
 *                                                  *
 *                Helper functions                  *
 *                                                  *
 ================================================== */

import { winnerResult } from './helpers/winnerResult.js'

/* ================================================== 
 *                                                  *
 *                Helper functions                  *
 *                                                  *
 ================================================== */


/* ================================================== 
*                                                  *
*                Import Models                     *
*                                                  *
================================================== */

import Period from './models/periodModel.js'

/* ================================================== 
*                                                  *
*                Import Models                     *
*                                                  *
================================================== */


const __dirname = path.resolve(path.dirname(''));
dotenv.config()
connectDB()
const app = express()
const router = express.Router()


app.use(cors())


if (process.env.NODE_ENV == 'development') {
  app.use(morgan('dev'))
}

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: "50mb" }));


app.use('/api', mobileRoutes)
app.use('/api/admin', adminRoutes)


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
})

app.use('/uploads', express.static(path.join(__dirname, '/uploads')))
const PORT = process.env.PORT || 5010

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
)


async function updateGameId() {

  var result = await winnerResult();

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const current = now.getTime();

  // Get the current timestamp with hours, minutes, and seconds
  const nowTimestamp = new Date().getTime();

  // Calculate $firstperiodid and $lastperiodid
  const date = now.toISOString().split('T')[0].replace(/-/g, '');
  const firstperiodid = date + '001';
  now.setDate(now.getDate() - 1);
  const lastperiodid = now.toISOString().split('T')[0].replace(/-/g, '') + '480';

  const lastGameInfo = await Period.find({}).sort({ 'createdAt': -1 }).limit(1);

  if (lastGameInfo.length == 0) {
    await Period.create({
      gameId: firstperiodid
    })
    return 1;
  } else if (lastperiodid == lastGameInfo[0].gameId) {
    /* await Period.deleteMany({}); */
    await Period.create({
      gameId: firstperiodid
    })
    return 1;
  } else {
    var nextid = lastGameInfo[0].gameId + 1;
    /* nextid=20231102001; */
    await Period.create({
      gameId: nextid
    })
    return 1;
  }

}




/** Game Id update Cron */
var x = setInterval(async function () {

  var countDownDate = Date.parse(new Date) / 1e3;
  var distance = 180 - countDownDate % 180;
  /* console.log(distance) */
  if (distance == 1) {
    console.log(`${distance}`.red.bold)
    await updateGameId();
  }

}, 1e3);
/** Game Id update Cron */

