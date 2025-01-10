import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'

import { baseUrl, androidAppLink, serverUrl, bannerDir, profilePicDir, emailTempletsDir, emailTempletsImageDir, siteLogoDir, paymentSettingId, } from '../../config/constant.js'

import { getGameId } from '../../helpers/gameSettings.js'
import { userBonus } from '../../helpers/userBonus.js'

/**  ====================================================
 *        import  Models
    ===================================================== */

import User from '../../models/userModel.js';
import Betting from '../../models/bettingModel.js';
import Order from '../../models/orderModel.js'
import WalletReport from '../../models/walletReportsModel.js'
import Period from '../../models/periodModel.js'
import UserResult from '../../models/userResultModel.js'
import BonusReport from '../../models/bonusReportsModel.js'
import PaymentSettings from '../../models/paymentSettingsModel.js'

/**  ====================================================
 *        import  Models
 ===================================================== */

import dotenv from 'dotenv'
import moment from 'moment';
import Transactions from '../../models/transactionModel.js'








const dashboard = asyncHandler(async (req, res) => {


    if (req.user) {

    } else {
        res.status(200).json({ 'status': 0, 'message': 'Invalid user info, Please try again!' });
    }


})

const betNow = asyncHandler(async (req, res) => {

    var {
        contractmoney,
        amount,
        value,
        counter,
        presalerule,
        tab,
    } = req.body;

    console.log(req.body);

    if (req.user) {

        if (counter < 30) {
            res.status(200).json({ 'status': 2, 'message': "Invalid action,please try again !" })

        } else if ((contractmoney * amount) == 0) {
            res.status(200).json({ 'status': 2, 'message': "Invalid amount,please try again !" })
        } else if ((contractmoney * amount) < 10) {
            res.status(200).json({ 'status': 2, 'message': "Invalid contract count,please try again !" })
        } else {
            if ((req.user.wallet) < 10) {
                res.status(200).json({ 'status': 2, 'message': "You don\' have many, Please recharge amount. !" })
            } else if ((req.user.wallet) < (contractmoney * amount)) {
                res.status(200).json({ 'status': 2, 'message': "You don\' have many, Please recharge amount. !" })
            } else {
                const gameId = await getGameId();
                const finalAmount = (contractmoney * amount);
                await Betting.create({
                    gameId: gameId,
                    userId: req.user._id,
                    type: "button",
                    value: value,
                    amount: finalAmount,
                    tab: tab,
                    acceptRule: presalerule

                })

                // Transaction Start  =================================================================

                const orderDetails = await Order.create({
                    transactionId: gameId,
                    userId: req.user._id,
                    amount: finalAmount,
                    status: 1
                }) // Order Created

                const walletSummary = await WalletReport.create(
                    {
                        userId: req.user._id,
                        gameId: gameId,
                        orderId: orderDetails._id,
                        amount: finalAmount,
                        type: "Debit",
                        actionType: "Join"
                    }
                ) // Wallet Reports Added

                await User.updateOne({ _id: req.user._id }, { $inc: { wallet: (finalAmount * -1) } })

                // Transaction End  ===================================================================

                // Update Bonus  =================================================================

                await userBonus(req.user._id, req.user.referalCode, finalAmount, gameId)

                // Update Bonus  =================================================================  

                res.status(200).json({ 'status': 1, 'message': "Your contract is successful completed" });

            }

        }


    } else {
        res.status(200).json({ 'status': 0, 'message': 'Invalid User info. Please try again.' })
    }

})


const getPeriodId = asyncHandler(async (req, res) => {

    const lastGameInfo = await Period.findOne({}).sort({ 'createdAt': -1 }).select('-results').limit(1);

    res.status(200).json({ 'status': 1, 'data': lastGameInfo });


})

const getResultByCategory = asyncHandler(async (req, res) => {

    var {
        page,
        tabs
    } = req.body;

    var limit = 10;
    if (page == 0) {
        var skip = 1;
    } else {
        var skip = page * limit;
    }


    if (tabs == 'Emerd') {
        var arrayIndex = 3;
    } else if (tabs == 'Bcone') {
        var arrayIndex = 2;
    } else if (tabs == 'Sapre') {
        var arrayIndex = 1;
    } else {
        var arrayIndex = 0;
    }


    const resultCount = await Period.countDocuments();


    const lastGameInfo = await Period.aggregate([

        { $sort: { 'createdAt': -1 } },
        {
            $skip: skip
        },
        {
            $limit: limit
        },
        { $project: { result: { $arrayElemAt: ['$results', arrayIndex] }, gameId: 1 } }
    ]);

    res.status(200).json({ 'status': 1, 'data': lastGameInfo, 'resultCount': resultCount })


})


const getMyParityRecord = asyncHandler(async (req, res) => {

    var {
        page,
        tabs
    } = req.body;

    var limit = 10;
    var skip = page * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1)


    const parityRecords = await UserResult.find(
        {
            createdAt: {
                $gte: today,
                $lt: tomorrow,
            },
            tab: tabs
        }
    ).skip(skip).limit(limit).sort({ 'createdAt': -1 });

    const parityCount = await UserResult.countDocuments({
        createdAt: {
            $gte: today,
            $lt: tomorrow,
        },
        tab: tabs
    })

    res.status(200).json({ 'status': 1, 'parityRecords': parityRecords, 'parityCount': parityCount })


})

const getWalletBalance = asyncHandler(async (req, res) => {

    if (req.user) {
        res.status(200).json({ 'status': 1, 'walletBalance': req.user.wallet });
    } else {
        res.status(200).json({ 'status': 0, 'message': 'Invalid user info.' })
    }

})

const orderList = asyncHandler(async (req, res) => {

    var {
        startDate,
        endDate,
        actionType,
        page
    } = req.body;

    console.log(req.body);

    if (req.user) {

        var limit = 10;
        var skip = page * limit;

        var query = {
            'userId': req.user._id,
        };
        if ((startDate != '' && startDate != null) && (endDate != '' && endDate != null)) {

            query.createdAt = {
                $gte: startDate,
                $lt: endDate,
            }

        } else if (startDate != null && endDate == '') {
            query.createdAt = {
                $gte: startDate
            }

        }

        if (actionType != null) {
            query.actionType = actionType
        }


        const orderInfo = await WalletReport.find(query).skip(skip).limit(limit);
        const orderCount = await WalletReport.countDocuments(query);

        res.status(200).json({ 'orderCount': orderCount, 'orderInfo': orderInfo, 'status': 1 })

    } else {
        res.status(200).json({ 'status': 0, 'message': 'Invalid user info.' });
    }



})

const promositionInfo = asyncHandler(async (req, res) => {

    if (req.user) {

        var responseData = {
            'bonus': req.user.bonus
        }

        const level1Info = await User.countDocuments({ 'referalCode': req.user.ownCode });
        const level2Info = await BonusReport.countDocuments({ 'level1Id': req.user._id })

        res.status(200).json({ 'status': 1, 'bonusInfo': responseData, 'level1user': level1Info, 'level2user': level2Info, 'promostionCode': req.user.ownCode })
    } else {
        res.status(200).json({ 'status': 0, 'message': 'Invalid user info.' })
    }

})

const promositionRecords = asyncHandler(async (req, res) => {

    if (req.user) {

        const level1User = await User.find({ 'referalCode': req.user.ownCode }).select('fullName createdAt');
        const level2users = [];

        if (level1User.length > 0) {
            for (let i = 0; i < level1User.length; i++) {
                var level2userInfo = await User.find({ 'referalCode': level1User[i].ownCode }).select('fullName createdAt');
                level2users.push(...level2userInfo);
            }
        }

        res.status(200).json({ 'status': 1, 'level1Users': level1User, 'level2Users': level2users });

    } else {
        res.status(200).json({ 'status': 0, 'message': 'Invalid user info.' });
    }

})


const bonusWithdrawRecord = asyncHandler(async (req, res) => {

    if (req.user) {
        res.status(200).json({ 'status': 1, 'records': req.user.bonusWithdrawReports });
    } else {
        res.status(200).json({ 'status': 0, 'message': 'Invalid user info.' });
    }

})

const bonusRecords = asyncHandler(async (req, res) => {

    if (req.user) {

        var {
            page
        } = req.body;

        var limit = 10;
        var skip = page * limit;

        var query = {
            $or: [
                {
                    level1Id: req.user._id,
                },
                {
                    level2Id: req.user._id,
                },
            ]
        };


        const bonusRecords = await BonusReport.find(query).skip(skip).limit(limit).select('-userId -tradeAmount -__v -updatedAt');

        const bonusRecordsCount = await BonusReport.countDocuments(query)

        res.status(200).json({ 'status': 1, 'bonusRecords': bonusRecords, 'bonusRecordsCount': bonusRecordsCount })
    } else {
        res.status(200).json({ 'status': 0, 'message': 'Invalid user info.' })
    }

})

const withdrawbonus = asyncHandler(async (req, res) => {

    if (req.user) {
        var {
            amount
        } = req.body;

        const paymentSettingsInfo = await PaymentSettings.findById(paymentSettingId);

        if (amount < paymentSettingsInfo.minBonusWithdraw) {
            res.status(200).json({ 'status': 0, 'message': 'Minimum withdraw bonus amount ' + paymentSettingsInfo.minBonusWithdraw })
        } else {

            var userBonus = req.user.bonus;

            if (amount > userBonus.amount) {
                res.status(200).json({ 'status': 0, 'message': 'You do not have sufficient amount.' });
            } else {
                const userId = req.user._id;
                await User.updateOne(
                    {
                        _id: userId
                    }, {
                    $inc: {
                        'wallet': amount,
                        'bonus.amount': (amount * -1)
                    },
                    $push: {
                        'bonusWithdrawReports': {
                            'amount': amount
                        }
                    }
                }
                )
            }
            res.status(200).json({ 'status': 1, 'message': 'Successfully added to wallet.' })
        }

    } else {
        res.status(200).json({ 'status': 0, 'message': 'Invalid user info.' });
    }

})

const transactionRecords = asyncHandler(async (req, res) => {

    if (req.user) {

        var {
            page,
            actionType
        } = req.body;

        var limit = 10;
        var skip = page * limit;

        var query = {
            userId: req.user._id,
        }

        if (actionType != null) {
            query.actionType = actionType
        }

        const transactionDetails = await Transactions.find(query).skip(skip).limit(limit)

        const transactionCount = await Transactions.countDocuments(query)

        res.status(200).json({ 'status': 1, 'transactionDetails': transactionDetails, 'transactionCount': transactionCount })

    } else {
        res.status(200).json({ 'status': 0, 'message': 'Invalid user info.' })
    }

})

export {
    dashboard,
    betNow,
    getPeriodId,
    getResultByCategory,
    getMyParityRecord,
    getWalletBalance,
    orderList,
    promositionInfo,
    promositionRecords,
    bonusWithdrawRecord,
    bonusRecords,
    withdrawbonus,
    transactionRecords
}