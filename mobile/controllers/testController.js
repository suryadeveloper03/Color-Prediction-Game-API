import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import fs, { unlink, unlinkSync, readFileSync } from 'fs'
import path, { join, resolve } from 'path'
import multer from 'multer'
import { baseUrl, androidAppLink, serverUrl, bannerDir, profilePicDir, emailTempletsDir, emailTempletsImageDir, siteLogoDir } from '../../config/constant.js'
import generateToken from '../../utils/generateToken.js'

/**  ====================================================
 *        import  Models
    ===================================================== */

import User from '../../models/userModel.js'


/**  ====================================================
 *        import  Models
 ===================================================== */

import dotenv from 'dotenv'
import moment from 'moment';
import mime from 'mime'
import { commonSendMail, readHTMLFile, createEmailFile, adminEmail } from '../../config/mail.js'
import handlebars from 'handlebars'
import Cryptr from 'cryptr'
import { request } from 'http'
import https from 'https'
import Twilio from 'twilio'
import otpTool from 'otp-without-db'
import ManualResult from '../../models/manualResultModel.js'
import { resultbyUser } from '../../helpers/resultbyUser.js'
import { winner } from '../../helpers/winners.js'
import { userBonus } from '../../helpers/userBonus.js'
import { getGameId } from '../../helpers/gameSettings.js'




const __dirname = path.resolve()
dotenv.config()

const testApi = asyncHandler(async (req, res) => {

    userBonus('6540a0617ef54c7a01a0e4c0', 'QL29XFU8', 10, '123456')


    /* var tt = await resultbyUser(20231025158, 0, 'green', 31398, 'Parity') */

    res.status(200).json(1)

})

const checkWinner = asyncHandler(async (req, res) => {

    const gameId = getGameId();
    const bettingInfo = await winner(gameId, 'Parity', 'result');
    res.status(200).json(bettingInfo)

})


export {
    testApi,
    checkWinner
}