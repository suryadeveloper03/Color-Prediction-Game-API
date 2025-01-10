import express from 'express'
const router = express.Router()

import {
    userProduct
} from '../../middleware/authMiddleware.js'

import {
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

} from '../controllers/userController.js'


import {
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
} from '../controllers/gameController.js'

import {
    getPaymentToken,
    createPaymentLink,
    createOrder,
    capturePayment,
    cashFreeCreateOrder,
    cashFreeOrderDetails,
    payoutOrder
} from '../controllers/paymentController.js'


import {
    testApi,
    checkWinner
} from '../controllers/testController.js'



/** USERS INFO */
router.get('/homepage', homePage);
router.post('/sentotp', sentOTP);
router.post('/otpverify', otpVerify);
router.post('/resendotp', resendOtp);
router.post('/authuser', authUser);
router.post('/forgetpassword', forgetPassword);
router.post('/registeruser', registerUser);
router.post('/changepassword', userProduct, changePassword);
router.post('/updatepassword', updatePassword);
router.post('/changeuserprofile', userProduct, changeUserProfile);
router.post('/userinfo', userProduct, userInfo);
router.post('/updateuserinfo', userProduct, updateUserInfo);
router.post('/updatephone', userProduct, updatePhone);
router.post('/updatephoneverify', userProduct, updatePhoneVerify);
router.post('/resetpasswordotp', resetPasswordOTP);
/** USERS INFO */

/** BANK INFO */
router.post('/addbankinfo', userProduct, addBankInfo);
router.post('/getmybankinfo', userProduct, getBankInfo);
router.post('/deletebankinfo', userProduct, deleteBankInfo);
/** BANK INFO */

/** GAME INFO  */

router.post('/dashboard', userProduct, dashboard);
router.post('/betnow', userProduct, betNow);
router.post('/getperiodid', userProduct, getPeriodId);
router.post('/getresultbycategory', userProduct, getResultByCategory);
router.post('/getmyparityrecord', userProduct, getMyParityRecord);
router.post('/getwalletbalance', userProduct, getWalletBalance);
router.post('/orderlist', userProduct, orderList);
router.post('/getpromosition', userProduct, promositionInfo);
router.post('/promositionrecords', userProduct, promositionRecords);
router.post('/bonuswithdrawrecord', userProduct, bonusWithdrawRecord);
router.post('/bounsrecords', userProduct, bonusRecords);
router.post('/withdrawbonus', userProduct, withdrawbonus);
router.post('/transactionrecords', userProduct, transactionRecords);


/** GAME INFO  */


/** PAYMENT INFO */

//setu deeplink
router.post('/getpaymenttoken', getPaymentToken);
router.post('/createpaymentlink', createPaymentLink);

// Razor Pay

router.post('/createOrder', userProduct, createOrder);
router.post('/capturePayment', userProduct, capturePayment);

//Cashfree

router.post('/cashfreecreateorder', userProduct, cashFreeCreateOrder);
router.post('/cashfreeorderdetails', cashFreeOrderDetails);
router.post('/payoutorder', payoutOrder);

/** PAYMENT INFO */


router.post('/testapi', testApi);
router.post('/checkWinner', checkWinner);


export default router