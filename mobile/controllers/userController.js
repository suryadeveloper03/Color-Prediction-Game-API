import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import fs, { unlink, unlinkSync, readFileSync } from 'fs'
import path, { join, resolve } from 'path'
import multer from 'multer'
import { baseUrl, androidAppLink, serverUrl, bannerDir, profilePicDir, emailTempletsDir, emailTempletsImageDir, siteLogoDir, paymentSettingId, } from '../../config/constant.js'
import generateToken from '../../utils/generateToken.js'

/**  ====================================================
 *        import  Models
    ===================================================== */

import User from '../../models/userModel.js'
import PaymentSettings from '../../models/paymentSettingsModel.js'

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



const __dirname = path.resolve()
dotenv.config()


const sentOTP = asyncHandler(async (req, res) => {


    var phone = req.body.phone;
    console.log(phone)
    if (phone != null && phone != '' && phone != 'undefined' && phone != undefined) {
        /* const otp = Math.floor(1000 + Math.random() * 9000); */
        const otp = 123456;
        const hash = otpTool.createNewOTP(phone, otp, process.env.OTPSECRETKEY);
        var bodymsg = "[#] Use " + otp + " as your verification code on " + process.env.SITENAME + ". The OTP expire with in 10min."
        var smsSendNumber = '+91' + phone;
        console.log(bodymsg)
        console.log(hash)

        /* const client = new Twilio(process.env.TWILLOSID, process.env.TWILLOTOKEN);
 
          await client.messages
             .create({
                 body: bodymsg,
                 to: smsSendNumber,
                 from: '+1 928 857 8858',
             }) */

        res.status(200).json({ 'status': 1, 'verify': hash })
    } else {
        res.status(200).json({ 'message': 'Please enter your number.', 'status': 0 })
    }

})
const resendOtp = asyncHandler(async (req, res) => {

    var phone = req.body.phone;

    console.log(req.body);

    if (phone != null && phone != '' && phone != 'undefined' && phone != undefined) {
        /* const otp = Math.floor(1000 + Math.random() * 9000); */
        const otp = 123456;
        const hash = otpTool.createNewOTP(phone, otp, process.env.OTPSECRETKEY);
        var bodymsg = "[#] Use " + otp + " as your verification code on " + process.env.SITENAME + ". The OTP expire with in 10min."
        var smsSendNumber = '+91' + phone;
        console.log(bodymsg)
        console.log(hash)

        /* const client = new Twilio(process.env.TWILLOSID, process.env.TWILLOTOKEN);
          await client.messages
             .create({
                 body: bodymsg,
                 to: smsSendNumber,
                 from: '+1 928 857 8858',
             }) */

        res.status(200).json({ 'verify': hash, 'status': 1 })
    } else {
        res.status(200).json({ 'message': 'Please enter your number.', 'status': 0 })
    }

})

const otpVerify = asyncHandler(async (req, res) => {

    var {
        hash,
        otp,
        phone,
    } = req.body;
    console.log(req.body)

    const otpVerify = otpTool.verifyOTP(phone, otp, hash, process.env.OTPSECRETKEY);
    if (otpVerify) {
        res.status(200).json({ 'status': 1, 'message': 'Successfully OTP Verifed.' })

    } else {
        res.status(200).json({ 'message': 'Invalid OTP Number.', 'status': 0 })
    }


})

const authUser = asyncHandler(async (req, res) => {

    var {
        phone,
        password
    } = req.body;


    if (password != '' && phone != '') {
        const userExist = await User.findOne({ phone: phone })
        console.log(userExist)
        if (userExist && await (userExist.matchPassword(password))) {

            if (userExist.isActive) {

                var ip;
                if (req.headers['x-forwarded-for']) {
                    ip = req.headers['x-forwarded-for'].split(",")[0];
                    console.log(ip)
                } else {
                    ip = req.ip;

                }

                userExist.lastLoginIp = ip;
                userExist.lastLoginDate = new Date();
                await userExist.save();

                var data = {
                    "token": generateToken(userExist._id),
                    "userId": userExist._id,
                    "email": userExist.email,
                }
                res.status(200).json({ data, "imageDirectory": profilePicDir, 'status': 1 })
            } else {
                res.status(200).json({ "message": "Your account deactivated, Please contact admin.", 'status': 0 })
            }
        } else {
            res.status(200).json({ "message": "Invalid Password.", 'status': 0 })
        }
    } else {
        res.status(200).json({ "message": "Please Enter input field.", 'status': 0 })
    }

})



const forgetPassword = asyncHandler(async (req, res) => {

    var {
        phone
    } = req.body;

    const phoneExist = await User.findOne({ phone: phone })
    if (phoneExist) {

        const userDetails = await User.findById(phoneExist._id)
        var password = await generatePass(10);
        password = 123456;
        userDetails.password = password;
        await userDetails.save()
        readHTMLFile(__dirname + '/' + emailTempletsDir + 'password-change.html', function (err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                pwd: password,
            };
            var htmlToSend = template(replacements);
            var mailOptions = {
                from: adminEmail,
                to: userDetails.email,
                subject: 'Forget password',
                html: htmlToSend,
                attachments: [
                    {
                        filename: 'siteLogo.png',
                        path: baseUrl + siteLogoDir,
                        cid: 'siteLogo'
                    },
                    {
                        filename: 'gif-resetpass.gif',
                        path: baseUrl + emailTempletsImageDir + 'gif-resetpass.gif',
                        cid: 'pasGif'
                    },
                    {
                        filename: 'facebook2x.png',
                        path: baseUrl + emailTempletsImageDir + 'facebook2x.png',
                        cid: 'fb'
                    },
                    {
                        filename: 'twitter2x.png',
                        path: baseUrl + emailTempletsImageDir + 'twitter2x.png',
                        cid: 'tw'
                    },
                    {
                        filename: 'instagram2x.png',
                        path: baseUrl + emailTempletsImageDir + 'instagram2x.png',
                        cid: 'ins'
                    },

                ]
            }
            commonSendMail(mailOptions)
            res.status(200).json({ "message": "Successfully send mail", 'status': 1 })
        });

    } else {
        res.status(200).json({ 'message': 'Invalid Mobile Number', 'status': 0 })
    }

})

const registerUser = asyncHandler(async (req, res) => {

    var {
        phone,
        email,
        password,
        fullName,
        rcode
    } = req.body;
    console.log(req.body);
    const phoneExist = await User.findOne({ phone: phone });
    if (phoneExist) {
        res.status(200).json({ 'message': 'Phone number already exist.', 'status': 0 })
    } else {
        const referalUser = await User.findOne({ 'ownCode': rcode });
        if (referalUser) {
            const ownCode = await generateCode();
            const paymentSettingsDetails = await PaymentSettings.findById(paymentSettingId);
            const userDetails = await User.create(
                {
                    phone: phone,
                    email: email,
                    fullName: fullName,
                    password: password,
                    referalCode: rcode,
                    ownCode: ownCode,
                    wallet: paymentSettingsDetails.bonusAmount
                }
            );

            var data = {
                'token': generateToken(userDetails._id),
                "userId": userDetails._id,
                'email': userDetails.email
            }

            res.status(200).json({ data, 'status': 1 });
        } else {
            res.status(200).json({ 'status': 0, 'message': 'Invalid Referal Code.' });
        }

    }

})


const homePage = asyncHandler(async (req, res) => {



})


const changePassword = asyncHandler(async (req, res) => {

    var {
        userId,
        currentPassword,
        newPassword,
        confirmPassword

    } = req.body;

    console.log(req.body);

    const userExist = await User.findById(userId)
    if (userExist && await (userExist.matchPassword(currentPassword))) {
        if (newPassword == confirmPassword) {

            userExist.password = confirmPassword;
            await userExist.save()

            res.status(200).json({ "message": "Successfully updated your password", 'status': 1 })

        } else {
            res.status(200).json({ "message": "Not match new password and confirm password", 'status': 0 })
        }

    } else {
        res.status(200).json({ "message": "Wrong password", 'status': 0 })
    }

})

const updatePassword = asyncHandler(async (req, res) => {

    var {
        newPassword,
        confirmPassword,
        phone
    } = req.body;
    if (newPassword == confirmPassword) {
        const userExist = await User.findOne({ 'phone': phone });

        if (userExist) {
            userExist.password = newPassword;
            await userExist.save();
            res.status(200).json({ 'status': 1, 'message': 'Successfully password changed.' })

        } else {
            res.status(200).json({ 'status': 0, 'message': 'Invalid user details.' })
        }
    } else {
        res.status(200).json({ 'status': 0, 'message': 'Password miss match.' })
    }


})


const changeUserProfile = asyncHandler(async (req, res) => {

    var {
        userId,
        userImage
    } = req.body;

    const userData = await User.findById(userId)
    if (userImage != '') {

        if (userData) {

            var decodedImg = decodeBase64Image(userImage)
            var imageBuffer = decodedImg.data
            var type = decodedImg.type
            var extension = mime.getExtension(type)
            var fileName = (new Date()).getTime().toString(36) + Math.random().toString(36).slice(2) + '.' + extension
            try {
                fs.writeFileSync(__dirname + '/' + profilePicDir + '/' + fileName, imageBuffer, 'utf8')
                if (userData.profilepic == '' || userData.profilepic == null || userData.profilepic == ' ') {
                    userData.profilepic = fileName;
                } else {

                    try {
                        unlinkSync(__dirname + '/' + profilePicDir + userData.profilepic)
                    } catch (error) {
                        console.log(error)
                    }
                    userData.profilepic = fileName;
                }

                await userData.save()
                res.status(200).json({ "message": "Successfully updated", "imageDirectory": profilePicDir, 'profilepic': fileName, 'status': 1 })
            } catch (err) {
                res.status(200).json({ err, 'status': 0 })
            }
        } else {
            res.status(200).json({ "message": "Invalid user details", 'status': 0 })
        }

    } else {
        res.status(200).json({ "message": "Please upload image", 'status': 0 })
    }

})




const userInfo = asyncHandler(async (req, res) => {

    var userId = req.body.userId;
    console.log(userId)
    var hiddenitem = { 'password': 0, 'isActive': 0, 'lastLoginIp': 0, 'lastLoginDate': 0, 'bonus': 0, 'referalCode': 0 };
    const userInfo = await User.findById(userId).select(hiddenitem)
    if (userInfo) {
        res.status(200).json({ "userInfo": userInfo, "status": 1, "profileDir": profilePicDir })
    } else {
        res.status(200).json({ 'message': "Invalid user info", "status": 0 })
    }

})

const updateUserInfo = asyncHandler(async (req, res) => {

    var {
        field,
        value,
        userId
    } = req.body;
    console.log(req.body)
    const userDetails = await User.findById(userId);

    if (userDetails) {

        userDetails[field] = value;
        await userDetails.save();
        res.status(200).json({ 'status': 1, 'message': 'Successfully updated.' })


    } else {
        res.status(200).json({ 'status': 0, 'message': 'Invalid user info.' })
    }

})


const updatePhone = asyncHandler(async (req, res) => {


    var {
        phone,
        userId
    } = req.body;
    const phoneExist = await User.countDocuments({ phone: phone, _id: { $ne: userId } })
    if (phoneExist > 0) {
        res.status(200).json({ 'status': 0, 'message': 'phone already exists.' })
    } else {
        const userDetails = await User.findById(userId)

        if (userDetails) {

            /* const otp = Math.floor(1000 + Math.random() * 9000); */
            const otp = 123456;
            const hash = otpTool.createNewOTP(phone, otp, process.env.OTPSECRETKEY);
            var bodymsg = "[#] Use " + otp + " as your verification code on " + process.env.SITENAME + ". The OTP expire with in 10min."
            var smsSendNumber = '+91' + phone;
            console.log(bodymsg)
            console.log(hash)

            /*const client = new Twilio(process.env.TWILLOSID, process.env.TWILLOTOKEN);
             await client.messages
                .create({
                    body: bodymsg,
                    to: smsSendNumber,
                    from: '+1 928 857 8858',
                }) */

            res.status(200).json({ 'verify': hash, 'status': 1 })

        } else {
        }
    }

})


const updatePhoneVerify = asyncHandler(async (req, res) => {

    var {
        hash,
        otp,
        phone,
        updatePhone,
        userId
    } = req.body;
    const phoneExist = await User.countDocuments({ phone: phone, _id: { $ne: userId } })
    if (phoneExist > 0) {
        res.status(200).json({ 'status': 0, 'message': 'phone already exists.' })
    } else {
        const otpVerify = otpTool.verifyOTP(phone, otp, hash, process.env.OTPSECRETKEY);
        if (otpVerify) {
            await User.updateOne({ _id: userId }, { $set: { 'phone': updatePhone } })

            res.status(200).json({ 'status': 1, 'message': 'Successfully updated.' })

        } else {
            res.status(200).json({ 'message': 'Invalid OTP Number.', 'status': 0 })
        }
    }

})


const addBankInfo = asyncHandler(async (req, res) => {

    const {
        bankId,
        name,
        ifscCode,
        bankName,
        accountNo,
        mobile,
        upiId,

    } = req.body;

    if (req.user) {

        if (bankId != null) {

            if ((req.user.bankDetails).length > 0) {

                var updateBankDetails = (req.user.bankDetails).map(function (v, i) {
                    if ((v._id).valueOf() == bankId) {
                        v.name = name;
                        v.ifscCode = ifscCode;
                        v.ifscCode = ifscCode;
                        v.bankName = bankName;
                        v.accountNo = accountNo;
                        v.mobile = mobile;
                        v.upiId = upiId;
                        return v;
                    } else {
                        return v;
                    }
                })

                await User.updateOne({ '_id': req.user._id }, { $set: { bankDetails: updateBankDetails } })
                res.status(200).json({ 'status': 1 });
            } else {
                res.status(200).json({ 'status': 0, 'message': 'You don\'t have access to bank details.' });
            }

        } else {
            if ((req.user.bankDetails).length < 5) {
                var bankInfo = req.body;
                await User.updateOne({ '_id': req.user._id }, { $push: { bankDetails: bankInfo } })
                res.status(200).json({ 'status': 1, 'message': 'New Bank Information added successfully.' })

            } else {
                res.status(200).json({ 'status': 0, 'message': 'Max 5 Bank details only add.' })
            }
        }

    } else {
        res.status(200).json({ "message": 'Invalid user info', 'status': 0 })
    }

})


const getBankInfo = asyncHandler((async (req, res) => {

    if (req.user) {

        res.status(200).json({ 'status': 1, 'bankInfo': req.user.bankDetails })

    } else {
        res.status(200).json({ 'status': 0, 'message': 'Invalid user info.' });
    }

}))

const deleteBankInfo = asyncHandler(async (req, res) => {

    const bankId = req.body.id;

    if (req.user) {
        var updateBankDetails = (req.user.bankDetails).filter(function (v, i) {
            if ((v._id).valueOf() != bankId) {
                return v;
            }
        })
        await User.updateOne({ '_id': req.user._id }, { $set: { bankDetails: updateBankDetails } })
        res.status(200).json({ 'status': 1 });
    } else {
        res.status(200).json({ "message": 'Invalid user info', 'status': 0 })
    }

})

const resetPasswordOTP = asyncHandler(async (req, res) => {

    var phone = req.body.phone;

    console.log(req.body);

    if (phone != null && phone != '' && phone != 'undefined' && phone != undefined) {
        const phoneExist = await User.findOne({ 'phone': phone });
        if (phoneExist) {
            /* const otp = Math.floor(1000 + Math.random() * 9000); */
            const otp = 123456;
            const hash = otpTool.createNewOTP(phone, otp, process.env.OTPSECRETKEY);
            var bodymsg = "[#] Use " + otp + " as your verification code on " + process.env.SITENAME + ". The OTP expire with in 10min."
            var smsSendNumber = '+91' + phone;
            console.log(bodymsg)
            console.log(hash)

            /* const client = new Twilio(process.env.TWILLOSID, process.env.TWILLOTOKEN);
              await client.messages
                 .create({
                     body: bodymsg,
                     to: smsSendNumber,
                     from: '+1 928 857 8858',
                 }) */

            res.status(200).json({ 'verify': hash, 'status': 1 })
        } else {
            res.status(200).json({ 'status': 0, 'message': 'Phone Number does not exist.' })
        }

    } else {
        res.status(200).json({ 'message': 'Please enter your number.', 'status': 0 })
    }


})

async function generatePass(pLength) {

    var keyListAlpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        keyListInt = "123456789",
        keyListSpec = "!@#%*&",
        password = '';
    var len = Math.ceil(pLength / 2);
    len = len - 1;
    var lenSpec = pLength - 2 * len;

    for (var i = 0; i < len; i++) {
        password += keyListAlpha.charAt(Math.floor(Math.random() * keyListAlpha.length));
        password += keyListInt.charAt(Math.floor(Math.random() * keyListInt.length));
    }

    for (var i = 0; i < lenSpec; i++) {
        password += keyListSpec.charAt(Math.floor(Math.random() * keyListSpec.length));
    }

    password = password.split('').sort(function () { return 0.5 - Math.random() }).join('');


    return password;
}


async function generateCode() {
    var length = 8,
        charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    const ownCode = await User.findOne({ 'ownCode': retVal });
    if (ownCode) {
        return generateCode();
    } else {
        return retVal;
    }

}


/* ===============================================================
            decodeBase64Image
   =============================================================== */


function decodeBase64Image(dataString) {

    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {}
    if (matches.length !== 3) {
        return new Error('Invalid input string')
    }
    response.type = matches[1]
    response.data = new Buffer.from(matches[2], 'base64')
    return response
}



export {
    sentOTP,
    otpVerify,
    resendOtp,
    authUser,
    forgetPassword,
    registerUser,
    homePage,
    changePassword,
    updatePassword,
    changeUserProfile,
    userInfo,
    updateUserInfo,
    updatePhone,
    updatePhoneVerify,
    addBankInfo,
    getBankInfo,
    deleteBankInfo,
    resetPasswordOTP
}