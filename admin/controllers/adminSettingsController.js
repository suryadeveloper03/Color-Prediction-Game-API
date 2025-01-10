import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import path, { resolve } from 'path'
import multer from 'multer'
import { adminSettingId, paymentSettingId } from '../../config/constant.js'
/**  ====================================================
 *        import  Models
    ===================================================== */

import AdminSettings from '../../models/adminSettingsModel.js'
import PaymentSettings from '../../models/paymentSettingsModel.js'
import User from '../../models/userModel.js'

/**  ====================================================
 *        import  Models
 ===================================================== */

import dotenv from 'dotenv'
import moment from 'moment';

const __dirname = path.resolve()
dotenv.config()

const adminSettings = asyncHandler(async (req, res) => {

    const adminSettingsInfo = await AdminSettings.findById(adminSettingId);
    var data = {};
    data['adminSettingsInfo'] = adminSettingsInfo;
    data['imageDirectory'] = 'uploads/';
    data['status'] = '1';
    res.status(200).json(data)

})

const addEditAdminSettings = asyncHandler(async (req, res) => {

    const AdminSetting = await AdminSettings.findById(adminSettingId)
    if (AdminSetting) {
        AdminSetting.metaTitle = req.body.metaTitle
        AdminSetting.metaDescription = req.body.metaDescription
        AdminSetting.metaKeywords = req.body.metaKeywords
        AdminSetting.fbAppId = req.body.fbAppId
        AdminSetting.fbAppSecret = req.body.fbAppSecret
        AdminSetting.twitterAppId = req.body.twitterAppId
        AdminSetting.twitterName = req.body.twitterName
        AdminSetting.homeTitle1 = req.body.homeTiadminsettingstle1
        AdminSetting.homeTitle2 = req.body.homeTitle2
        AdminSetting.copyRight = req.body.copyRight
        AdminSetting.gmailClientId = req.body.gmailClientId
        AdminSetting.gmailClientSecret = req.body.gmailClientSecret
        AdminSetting.gmailRedirectUrl = req.body.gmailRedirectUrl
        AdminSetting.gmapKey = req.body.gmapKey
        AdminSetting.googleDataStudioLink = req.body.googleDataStudioLink
        AdminSetting.googleAnalytics = req.body.googleAnalytics
        AdminSetting.twilloSid = req.body.twilloSid
        AdminSetting.twilloToken = req.body.twilloToken
        AdminSetting.geoMapKey = req.body.geoMapKey
        AdminSetting.bingMapSportal = req.body.bingMapSportal
        await AdminSetting.save()
        var data = {};
        data['adminSetting'] = AdminSetting;
        data['status'] = 1;
        data['imageDirectory'] = 'uploads/';
        res.status(200).json(data)
    } else {
        res.status(201).status({ "status": 0, "message": "Invalid AdminSetting ID" })
    }

})

const uploadSiteLogo = asyncHandler(async (req, res) => {
    uploadImage(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            err['status'] = "0"
            return res.status(201).json(err)
        } else if (err) {
            err['status'] = "0"
            return res.status(201).json(err)
        }


        updateDraft(req, res)

    })
})


var draftmusicstorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, req.body.columnName + '' + path.extname(file.originalname))
    }
})





/* check the image file extension */
export function checkimageFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|ico|PNG|JPEG|JPG/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (extname && mimetype) {
        return cb(null, true)
    } else {
        cb({ "name": "MulterError", "message": "Invalid File Type" })
    }
}

/* uploader file for image uploads */
var uploadImage = multer({

    storage: draftmusicstorage,
    limits: {
        fileSize: 9000000  // 
    },
    fileFilter: function (req, file, cb) {
        checkimageFileType(file, cb)
    },
}).single('image')

const updateDraft = asyncHandler(async (req, res) => {

    const settings = await AdminSettings.findById(adminSettingId)
    var columnName = req.body.columnName;
    console.log(req.file.filename)
    console.log(columnName)
    settings[columnName] = req.file.filename
    await settings.save()
    var data = { "status": 1, "name": req.file.filename, "message": "Successfully uploaded", "imageDirecotry": 'uploads/' }
    res.status(200).json(data)


})


const dashboard = asyncHandler(async (req, res) => {
    var getDateMonth = new Date().getDate();
    const momentDate = moment();
    const getDate = momentDate.subtract((getDateMonth - 1), 'days');
    const fourMonth = getDate.subtract(4, 'months');
    const startWeekDay = moment().day(0);
    const endWeekDay = moment().day(6);
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');

    const newUserCount = await User.aggregate(
        [
            {
                $match: {
                    createdAt: { $gte: new Date(fourMonth) }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    userCount: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    '_id.month': 1
                }
            }
        ]
    )


    const currentWeekUserCount = await User.find({
        $and: [
            {
                'createdAt': { $gte: new Date(startWeekDay) }

            },
            {
                'createdAt': { $lte: new Date(endWeekDay) }

            }
        ]
    }).count()



    var data = {};
    data.newUserCount = newUserCount;
    data.currentWeekUserCount = currentWeekUserCount;



    res.status(200).json(data)

})

const generalReport = asyncHandler(async (req, res) => {

    var monthStartDate = moment("2022-11-05").subtract(1, 'months').startOf('month');
    var previousMonthEndDate = moment("2022-11-05").subtract(1, 'months').endOf('month');
    var currentMonthStartDate = moment("2022-11-05").startOf('month')
    var monthEndDate = moment("2022-11-05").endOf('month');

    var itemSaleCount = 0;
    var salePercentIncrease = 0;
    var newOrderPrecentIncrease = 0;
    var newProductPrecentIncrease = 0;

    const itemSale = await Order.aggregate(

        [
            {
                $match: {
                    'createdAt': {
                        $gte: new Date(monthStartDate),
                        $lte: new Date(monthEndDate)
                    }
                }
            }, {
                $group: {
                    '_id': {
                        'day': {
                            $month: '$createdAt'
                        }
                    },
                    'saleCount': {
                        $sum: '$quantity'
                    }
                }
            }, {
                $sort: {
                    '_id.day': 1
                }
            }
        ]
    )

    if (itemSale.length > 0) {

        if (itemSale[0]._id.day == monthStartDate.format("M")) {
            itemSaleCount = itemSale[1].saleCount;
            salePercentIncrease = ([((itemSale[0].saleCount) - (itemSale[1].saleCount)) / (itemSale[1].saleCount)] * 100)
        } else {
            itemSaleCount = itemSale[0].saleCount
            salePercentIncrease = ([((itemSale[0].saleCount) - 1) / 1] * 100)
        }

    }


    const previousOrdercount = await Order.find({
        'createdAt': {
            $gte: new Date(monthStartDate),
            $lte: new Date(previousMonthEndDate)
        }
    }).count();

    const newOrder = await Order.find({
        'createdAt': {
            $gte: new Date(currentMonthStartDate),
            $lte: new Date(monthEndDate)
        }
    }).count();

    if (previousOrdercount == 0 || previousOrdercount == 1) {
        newOrderPrecentIncrease = ([((newOrder) - 1) / 1] * 100)
    } else {
        newOrderPrecentIncrease = ([((newOrder) - previousOrdercount) / previousOrdercount] * 100)
    }

    const previousProductcount = await Product.find({
        'createdAt': {
            $gte: new Date(monthStartDate),
            $lte: new Date(previousMonthEndDate)
        }
    }).count();

    const newProductCount = await Product.find({
        'createdAt': {
            $gte: new Date(currentMonthStartDate),
            $lte: new Date(monthEndDate)
        }
    }).count();

    if (previousProductcount == 0 || previousProductcount == 1) {
        newProductPrecentIncrease = ([((newProductCount) - 1) / 1] * 100)
    } else {
        newProductPrecentIncrease = ([((newProductCount) - previousProductcount) / previousProductcount] * 100)
    }

    var data = {
        "itemSale": {
            "count": itemSaleCount,
            "percent": salePercentIncrease
        },
        "newOrder": {
            "count": newOrder,
            "percent": newOrderPrecentIncrease
        },
        "totalProduct": {
            "count": newProductCount,
            "percent": newProductPrecentIncrease
        }
    }


    res.status(200).json(data)

})

const updatePaymentSettings = asyncHandler(async (req, res) => {

    const {
        rechargeAmount,
        withdrawalAmount,
        bonusAmount,
        rechargeBonus,
        level1Bonus,
        level2Bonus,
        minBonusWithdraw,
        razorPayKey,
        razorPaySecret
    } = req.body;
    const paymentSettingsDetails = await PaymentSettings.findById(paymentSettingId);

    paymentSettingsDetails.rechargeAmount = rechargeAmount;
    paymentSettingsDetails.withdrawalAmount = withdrawalAmount;
    paymentSettingsDetails.bonusAmount = bonusAmount;
    paymentSettingsDetails.rechargeBonus = rechargeBonus;
    paymentSettingsDetails.level1Bonus = level1Bonus;
    paymentSettingsDetails.level2Bonus = level2Bonus;
    paymentSettingsDetails.minBonusWithdraw = minBonusWithdraw;
    paymentSettingsDetails.razorPayKey = razorPayKey;
    paymentSettingsDetails.razorPaySecret = razorPaySecret;
    await paymentSettingsDetails.save();
    res.status(200).json({ 'status': 1 });

})

const getPaymentSettings = asyncHandler(async (req, res) => {

    const paymentDetais = await PaymentSettings.findById(paymentSettingId);
    res.status(200).json({ 'status': 1, 'paymentSettingsDetails': paymentDetais });

})

export {
    adminSettings,
    addEditAdminSettings,
    uploadSiteLogo,
    dashboard,
    generalReport,
    updatePaymentSettings,
    getPaymentSettings
}