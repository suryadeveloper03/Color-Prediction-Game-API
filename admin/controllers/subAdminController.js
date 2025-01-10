import asyncHandler from 'express-async-handler'
import fs, { unlink, unlinkSync } from 'fs'
import path, { resolve } from 'path'
import { baseUrl, androidAppLink, serverUrl, bannerDir, emailTempletsDir, emailTempletsImageDir, siteLogoDir } from '../../config/constant.js'
import generateToken from '../../utils/generateToken.js'

/**  ====================================================
 *        import  Models
    ===================================================== */

import SubAdmin from '../../models/subAdminModel.js'

/**  ====================================================
 *        import  Models
 ===================================================== */

import dotenv from 'dotenv'
import { commonSendMail, readHTMLFile, createEmailFile, adminEmail } from '../../config/mail.js'
import handlebars from 'handlebars'
const __dirname = path.resolve()
dotenv.config()




/**  Admin Login check */
const authAdmin = asyncHandler(async (req, res) => {

    var {
        email,
        password,
    } = req.body
    console.log(req.body)
    const admin = await SubAdmin.findOne({
        email,
    })
    if (admin) {
        if (admin && (await admin.matchPassword(password))) {
            if (admin.isActive) {
                var data = {
                    _id: admin._id,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    email: admin.email,
                    token: generateToken(admin._id),
                };

                res.status(200).json({ 'status': 1, 'adminInfo': data })
            } else {
                res.status(201).json({ 'status': 0, "message": "Inactive admin email" })
            }
        } else {
            res.status(201).json({ 'status': 0, "message": "Invalid email or password" })
        }
    } else {
        res.status(201).json({ 'status': 0, "message": "Invalid email or password" })
    }


})


// Subadmin actions

const displaySubadmin = asyncHandler(async (req, res) => {

    var {
        search,
        limit,
        page
    } = req.body;
    var skip = (page - 1) * limit;

    var matchCondition = {};
    if (search != null && search != "") {
        matchCondition = {
            $or: [
                { firstName: { $regex: search , $options: "i" } },
                { lastName: { $regex: search , $options: "i" } },
                { email: { $regex: search , $options: "i" } }
            ]
        };
    }

    const subAdmins = await SubAdmin.aggregate(
        [
            {
                $match: matchCondition

            },
            {
                $facet: {
                    'data': [
                        {
                            $skip: skip
                        }, {
                            $limit: limit
                        }
                    ]
                }
            },
            {
                $project: {
                    'data.firstName': 1,
                    'data.lastName': 1,
                    'data._id': 1,
                    'data.email': 1,
                    'data.isActive': 1
                }
            }
        ]
    )

    const totalCount = await SubAdmin.find(matchCondition).count();

    res.status(200).json({ 'totalCount': totalCount, 'subAdmins': subAdmins })


})

const addSubadmin = asyncHandler(async (req, res) => {

    var {
        subadminId,
        firstName,
        lastName,
        email,
        password,
        permissions
    } = req.body
    if (subadminId != null) {

        const emailExist = await SubAdmin.find({
            email: email,
            _id: { $ne: subadminId }
        })

        if (emailExist == null || emailExist.length == 0) {
            const subAdminData = await SubAdmin.findById(subadminId)
            subAdminData.firstName = firstName
            subAdminData.lastName = lastName
            subAdminData.email = email
            if (password != '' && password != null && password != ' ') {
                console.log(password)
                subAdminData.password = password
            }
            //subAdminData.permissions = permissions
            await subAdminData.save()
            res.status(200).json(subAdminData)
        } else {
            res.status(201).json({ "status": 0, "message": 'Email already exists' })
        }
    } else {

        const adminExists = await SubAdmin.findOne({
            email,
        })
        if (adminExists) {
            res.status(201).json({ "status": 0, "message": 'Email already exists' })

        }

        const subadmin = await SubAdmin.create({
            firstName,
            lastName,
            email: email,
            password,

        })
        if (subadmin) {
            res.status(200).json({ "status": 1, "message": "successfully admin created", "adminDetails": subadmin })
        } else {
            res.status(201).json({ "status": 0, "message": 'Invalid subadmin data' })
        }
    }





})


const deletesubAdmin = asyncHandler(async (req, res) => {
    var deleteSubadmin = await SubAdmin.deleteOne({
        _id: req.body.id,
    })

    res.status(200).json({ "message": 'Successfully subadmin deleted', 'status': 1 })

})

const changeStatusSubAdmin = asyncHandler(async (req, res) => {
    const subAdminData = await SubAdmin.findById(req.body.id)
    subAdminData.isActive = req.body.status
    subAdminData.save()
    res.status(201).json({ "message": 'successfully change status', 'status': 1 })
})


const changeSubAdminStatus = asyncHandler(async (req, res) => {

    var {
        id,
        status
    } = req.body;

    const bannerDetails = await SubAdmin.findById(id);
    if (bannerDetails) {
        bannerDetails.isActive = status;
        await bannerDetails.save();
        res.status(200).json({ 'message': 'successfully changed status.' });
    } else {
        res.status(401).json({ 'message': "Invalid banner ID." });
    }

})


const getAdmindetails = asyncHandler(async (req, res) => {

    const adminId = req.body.adminId;
    const adminDetails = await SubAdmin.findById(adminId)
    if (adminDetails) {
        var data = {};
        data.firstName = adminDetails.firstName;
        data.lastName = adminDetails.lastName;
        data.email = adminDetails.email;
        data.permissions = adminDetails.permissions;

        res.status(200).json({ 'status': 1, 'adminInfo': adminDetails })
    } else {
        res.status(401).json({ "message": "Invalid subadmin", 'status': 0 })
    }


})

const sendForgotPassword = asyncHandler(async (req, res) => {

    const adminDetails = await SubAdmin.findOne({ email: req.body.email })
    if (adminDetails) {
        var time = Date.now()
        adminDetails.password = time;
        await adminDetails.save()
        readHTMLFile(__dirname + '/' + emailTempletsDir + 'password-change.html', function (err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                pwd: time,
            };
            var htmlToSend = template(replacements);
            var mailOptions = {
                from: adminEmail,
                to: adminDetails.email,
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
            res.status(200).json({ "message": "Successfully send mail" })
        });
    } else {
        res.status(401).json({ "message": "Invalid admin email" })
    }
})



export {
    authAdmin,
    displaySubadmin,
    addSubadmin,
    deletesubAdmin,
    changeStatusSubAdmin,
    getAdmindetails,
    sendForgotPassword,
    changeSubAdminStatus
}