import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'

/**  ====================================================
 *        import  Models
    ===================================================== */

import User from '../../models/userModel.js';
import Order from '../../models/orderModel.js'
import PaymentSettings from '../../models/paymentSettingsModel.js'

/**  ====================================================
 *        import  Models
 ===================================================== */

import dotenv from 'dotenv'
import moment from 'moment';

import http from 'https'
import axios from 'axios';
import Razorpay from 'razorpay';
import { paymentSettingId } from '../../config/constant.js';
import Transactions from '../../models/transactionModel.js';
import request from 'request';

import { Payouts } from '@cashfreepayments/cashfree-sdk';


const getPaymentToken = asyncHandler(async (req, res) => {



})

const createPaymentLink = asyncHandler(async (req, res) => {

    var options = {
        method: 'post',
        url: 'https://uat.setu.co/api/v2/auth/token',
        data: {
            clientID: 'ec13d61e-dd18-45b2-95a8-76ea32d5299c',
            secret: 'b0bc1538-f1a2-4a69-990c-693bb14d91c9'
        }
    };

    axios.request(options).then(function (response) {
        console.log(response.data.data.token);
        var options1 = {
            method: 'post',
            url: 'https://uat.setu.co/api/v2/payment-links',
            headers: {
                'X-Setu-Product-Instance-ID': '1284169142160590775',
                Authorization: 'Bearer ' + (response.data.data.token)
            },
            data: {
                billerBillID: 'API_TESTING_123',
                amount: { currencyCode: 'INR', value: 500 },
                expiryDate: '2023-12-06T12:34:28Z',
                amountExactness: 'EXACT',
                settlement: {
                    parts: [
                        {
                            account: { ifsc: 'ICICI000123', id: 'APIPL12345', name: 'API Playground' },
                            split: { unit: 'INR', value: 500 }
                        }
                    ],
                    primaryAccount: { id: 'APIPL12345', ifsc: 'ICICI000123', name: 'API Playground' }
                }
            }
        };

        axios.request(options1).then(function (response1) {
            res.status(200).json({ 'status': 1, 'res': response1.data });
        }).catch(function (error) {
            console.error(error);
        });
    }).catch(function (error) {
        console.error(error);
        res.status(200).json({ 'status': 0, 'error': error });
    });



})



const createOrder = asyncHandler(async (req, res) => {

    if (req.user) {

        var {
            amount
        } = req.body;



        const paymentSettingDetails = await PaymentSettings.findById(paymentSettingId);

        if (amount < paymentSettingDetails.rechargeAmount) {
            res.status(200).json({ 'status': 0, 'message': 'Minimum recharge amount is ' + paymentSettingDetails.rechargeAmount })
        } else {

            const instance = new Razorpay({
                key_id: paymentSettingDetails.razorPayKey,
                key_secret: paymentSettingDetails.razorPaySecret,
            });

            try {

                var receipt = "receipt#" + (new Date().getTime());
                const options = {
                    'amount': amount * 100, // amount == Rs 10
                    'currency': "INR",
                    'receipt': receipt,
                    'payment_capture': 1,
                    // 1 for automatic capture // 0 for manual capture
                };

                instance.orders.create(options, async function (err, order) {
                    if (err) {
                        console.log(err);
                        res.status(200).json({
                            'status': 0,
                            message: "Something Went Wrong",
                        });
                    } else {

                        const TransactionDetails = await Transactions.create(
                            {
                                userId: req.user._id,
                                amount: amount,
                                orderId: receipt,
                                actionType: "Recharge",
                                paymentStatus: "Pending"
                            }
                        )
                        order.transactionId = TransactionDetails._id
                        res.status(200).json({ order, 'status': 1 });
                    }
                });

            } catch (err) {
                res.status(200).json({
                    'status': 0,
                    message: "Something Went Wrong",
                });
            }
        }



    } else {
        res.status(200).json({ 'status': 0, 'message': 'Invalid user info.' });
    }



})

const capturePayment = asyncHandler(async (req, res) => {

    if (req.user) {

        var {
            transactionId,
            paymentId,
        } = req.body;

        console.log(req.body);

        const transactionDetails = await Transactions.findById(transactionId)

        if (transactionDetails) {

            if (transactionDetails.paymentStatus == "Completed") {

                res.status(200).json({ 'status': 0, 'message': 'Transaction Already Completed.' });

            } else {

                const paymentSettingDetails = await PaymentSettings.findById(paymentSettingId);
                try {
                    request(
                        {
                            method: "POST",
                            url: `https://${paymentSettingDetails.razorPayKey}:${paymentSettingDetails.razorPaySecret}@api.razorpay.com/v1/payments/${paymentId}/capture`,
                            form: {
                                'amount': ((transactionDetails.amount) * 100), // amount == Rs 10 // Same As Order amount
                                'currency': "INR",
                            },
                        },
                        async function (err, response, body) {
                            if (err) {
                                console.log(err);
                                res.status(200).json({
                                    message: "Something Went Wrong",
                                });
                            } else {
                                if (response.statusCode == 200) {

                                    await Transactions.updateOne({
                                        _id: transactionId
                                    },
                                        {
                                            $set: {
                                                paymentId: paymentId,
                                                paymentStatus: "Completed",
                                                paymentDate: new Date()
                                            }
                                        }
                                    );
                                    await User.updateOne(
                                        {
                                            _id: (transactionDetails.userId)
                                        },
                                        {
                                            $inc: {
                                                wallet: (transactionDetails.amount)
                                            }
                                        }
                                    )

                                    console.log("Status:", response.statusCode);
                                    console.log("Headers:", JSON.stringify(response.headers));
                                    console.log("Response:", body);


                                    res.status(200).json({ 'status': 1, 'message': body })

                                } else {
                                    res.status(200).json({ 'status': 0, 'message': body });
                                }

                            }
                        });
                } catch (err) {
                    console.log(err);
                    res.status(200).json({
                        message: "Something Went Wrong",
                    });
                }

            }


        } else {

            res.status(200).json({ 'status': 0, 'message': 'No transaction Details.' })
        }

    } else {
        res.status(200).json({ 'status': 0, 'message': 'Invalid user info.' });
    }


})


const cashFreeCreateOrder = asyncHandler(async (req, res) => {


    var suct = (new Date().getTime()).toString()

    const options = {
        method: 'POST',
        url: 'https://sandbox.cashfree.com/pg/orders',
        headers: {
            accept: 'application/json',
            'x-api-version': '2022-09-01',
            'content-type': 'application/json',
            'x-client-id': 'TEST1005630908c39ac5e30b2b0d7aff90365001',
            'x-client-secret': 'TEST1ef4e85d6b98470d0be9f6d3bd9d5540d90b4435'
        },
        data: {
            customer_details: { 'customer_id': suct, 'customer_phone': '2342434223' },
            order_currency: 'INR',
            order_amount: 10,
            order_meta: {
                return_url: 'https://example.com/return?order_id={order_id}',
                notify_url: 'http://192.168.0.121:5010/api/cashfreeorderdetails'
            }
        }
    };

    axios
        .request(options)
        .then(function (response) {
            console.log(response.data);
            res.status(200).json({ 'status': 1, 'data': response.data });
        })
        .catch(function (error) {
            console.error(error);
            res.status(200).json({ 'status': 0, 'error': error });
        });

})

const cashFreeOrderDetails = asyncHandler(async (req, res) => {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log(req.body);

})

const payoutOrder = asyncHandler(async (req, res) => {

    // Instantiate Cashfree Payouts
    const payoutsInstance = new Payouts({
        env: 'TEST',
        clientId: 'CF10056309CL4V307AUE8PRVA179U0',
        clientSecret: 'cfreesk_ma_t_376e0b5a0a35839852492ea179647e6e_43171048',
        pathToPublicKey: 'public-key/accountId_481788_public_key.pem',
        //"publicKey": "ALTERNATIVE TO SPECIFYING PATH (DIRECTLY PASTE PublicKey)"
    });

    /* const response = await payoutsInstance.beneficiary.add({
        "beneId": "JOHN180124", 
        "name": "john doe",
        "email": "johndoe@cashfree.com", 
        "phone": "9999999999", 
        "bankAccount": "00011020001772", 
        "ifsc": "HDFC0000001", 
        "address1" : "ABC Street", 
        "city": "Bangalore", 
        "state":"Karnataka", 
        "pincode": "560001"
    }); */



    /* const response = await payoutsInstance.transfers.requestTransfer({
        "beneId": "JOHN180124",
        "transferId": "tranfer00123111",
        "amount": "1.00",
    }); */

    /* const response = await payoutsInstance.transfers.getTransferStatus({
        "transferId": "tranfer00123111",
    }); */

    /*  const body = {
         beneId: 'GREEN0001',
         name: 'john doe',
         email: 'johndoe@cashfree.com',
         phone: '9876543210',
         bankAccount: '11111111222234',
         ifsc: 'HDFC0000001',
         address1: 'ABC Street',
         city: 'Bangalore',
         state: 'Karnataka',
         pincode: '560001',
       };
 
       const response = await payoutsInstance.beneficiary.add(body); */
    /* const body = {
      beneId: 'GREEN0001',
    };

    const response = await payoutsInstance.beneficiary.getById(body); */

    /*  const body = {
       bankAccount: '11111111222234',
       ifsc: 'HDFC0000001',
     };

     const response = await payoutsInstance.beneficiary.getIdByBankDetails(
       body,
     ); */

    /* const body = {
        beneId: 'GREEN0001',
        amount: '100.00',
        transferId: 'DEC2024',
    };

    const response = await payoutsInstance.transfers.requestTransfer(body); */

    const body = {
        referenceId: '14057',
        transferId: '658042946',
      };

      const response = await payoutsInstance.transfers.getTransferStatus(body);

    /* const response = await payoutsInstance.beneficiary
        .add({
            beneId: 'SURYA123',
            name: 'Surya',
            email: 'surya@cashfree.com',
            phone: '85214796325',
            bankAccount: '026291800001191',
            ifsc: 'YESB0000262',
            address1: 'ABC Street',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001',
        })

    console.log(response); */
    /*   const transfer = await payoutsInstance.transfers
          .requestTransfer({
              beneId: 'SURYA123',
              amount: '100.00',
              transferId: 'DESC0177',
          })
      console.log(transfer);
  
      const transferstatus = await payoutsInstance.transfers
          .getTransferStatus({
              referenceId: '658042665',
              transferId: 'DESC0177',
          }) */
    res.status(200).json(response)

})


export {
    getPaymentToken,
    createPaymentLink,
    createOrder,
    capturePayment,
    cashFreeCreateOrder,
    cashFreeOrderDetails,
    payoutOrder
}