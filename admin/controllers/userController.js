import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import fs, { unlink, unlinkSync } from 'fs'
import path, { resolve } from 'path'
import multer from 'multer'
import { baseUrl, androidAppLink, serverUrl, bannerDir, profilePicDir } from '../../config/constant.js'


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

const __dirname = path.resolve()
dotenv.config()


const displayUserList = asyncHandler(async (req, res) => {

    var {
        page,
        search,
        limit
    } = req.body;

    var skip = (page - 1) * limit;

    var matchCondition = {};
    if (search != null && search != "") {
        matchCondition = {
            $or: [
                { fullName: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        };
    }

    const userList = await User.aggregate(
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
                    ],
                    'totalCount': [
                        {
                            $count: 'count'
                        }
                    ]
                }
            }, {
                $project: {
                    'data.fullName': 1,
                    'data.email': 1,
                    'data.phone': 1,
                    'data.isActive': 1,
                    'data._id': 1,
                    'totalCount': {
                        $first: '$totalCount'
                    }
                }
            }
        ]
    )

    res.status(200).json(userList)

})




const addEditUser = asyncHandler(async (req, res) => {

    var {
        fullName,
        email,
        password,
        phone,
        id
    } = req.body;

    if (id != null) {

        const userDetails = await User.findById(id);
        if (userDetails) {
            if (userDetails.email != email) {
                const userEmailExist = await User.findOne({ email: email, '_id': { $ne: id } })
                if (userEmailExist) {

                    res.status(401).json({ 'message': 'This email already exist in user.' })

                } else {


                    userDetails.email = email;
                    userDetails.fullName = fullName;
                    userDetails.phone = phone;
                    if (password != null) {
                        userDetails.password = password;
                    }
                    await userDetails.save();
                    res.status(200).json({ 'message': 'Successfully updated.' })



                }
            } else {

                userDetails.email = email;
                userDetails.fullName = fullName;
                userDetails.phone = phone;
                if (password != '' && password != null) {

                    userDetails.password = password;
                }
                await userDetails.save();
                res.status(200).json({ 'message': 'Successfully updated.' })
            }


        } else {
            res.status(401).json({ 'message': 'Invalid User details.' })
        }

    } else {
        const userEmailExist = await User.findOne({ email: email })

        if (userEmailExist) {
            res.status(401).json({ 'message': 'This email already used user.' })
        } else {

            await User.create(
                {
                    fullName,
                    email,
                    password,
                    phone,
                }
            )
            res.status(200).json({ 'message': 'Successfully user created.' })



        }
    }

})

const changeUserStatus = asyncHandler(async (req, res) => {

    var {
        id,
        status
    } = req.body;

    const userDetails = await User.findById(id);
    if (userDetails) {
        userDetails.isActive = (!userDetails.status);
        await userDetails.save();
        res.status(200).json({ 'status': 1, 'message': "Successfully changed status." })
    } else {
        res.status(200).json({ 'message': "Invalid user details.", 'status': 0 })
    }

})

export {
    displayUserList,
    addEditUser,
    changeUserStatus

}