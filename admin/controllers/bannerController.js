import asyncHandler from 'express-async-handler'
import fs, { unlink, unlinkSync } from 'fs'
import path, { resolve } from 'path'
import multer from 'multer'
import { baseUrl, androidAppLink, serverUrl, bannerDir } from '../../config/constant.js'

/**  ====================================================
 *        import  Models
    ===================================================== */

import Banner from '../../models/bannerModel.js'
/**  ====================================================
 *        import  Models
===================================================== */

import dotenv from 'dotenv'
const __dirname = path.resolve()
dotenv.config()





const addBanner = asyncHandler(async (req, res) => {

    uploadImage(req, res, function (err) {

        if (err instanceof multer.MulterError) {
            err['status'] = "0"
            return res.status(201).json(err)
        } else if (err) {
            err['status'] = "0"
            return res.status(201).json(err)
        }

        addNewBanner(req, res)

    })

})

/* to save the image in draft folder with userId as file name */
var draftmusicstorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, bannerDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.parse(new Date()) + '' + path.extname(file.originalname))
    }
})



/* check the image file extension */
export function checkImageFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (extname && mimetype) {
        return cb(null, true)
    } else {
        cb({ "name": "MulterError", "message": "Invalid File Type" })
    }
}

var uploadImage = multer({
    storage: draftmusicstorage,
    limits: {
        fileSize: 9000000  // 
    },
    fileFilter: function (req, file, cb) {
        checkImageFileType(file, cb)
    },
}).single('image')


const addNewBanner = asyncHandler(async (req, res) => {

    var {
        bannerId,
        startDate,
        endDate,
        bannerType,
    } = req.body;

    if (bannerId != null) {

        const bannerExists = await Banner.findById(bannerId);

        if (bannerExists) {

          
            if (req.file != null) {
                try {
                    await unlinkSync(__dirname + '/' + bannerDir + bannerExists.image)
                } catch (error) {
                    console.log(error)
                }
                bannerExists.image = req.file.filename;
            }
            bannerExists.startDate = new Date(startDate);
            bannerExists.endDate = new Date(endDate);
            bannerExists.bannerType = bannerType;
    
            await bannerExists.save();
            res.status(200).json({ 'message': "Successfully saved." })

        } else {
            res.status(401).json({ 'message': "Invalid banner Id." })
        }

    } else {


        await Banner.create({
            image: req.file.filename,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            bannerType: bannerType,

        })
        res.status(200).json({ 'message': 'Banner created successfully.' });

    }

})


const changeBannerStatus = asyncHandler(async (req, res) => {

    var {
        id,
        status
    } = req.body;

    const bannerDetails = await Banner.findById(id);
    if (bannerDetails) {
        bannerDetails.isActive = status;
        await bannerDetails.save();
        res.status(200).json({ 'message': 'successfully changed status.' });
    } else {
        res.status(401).json({ 'message': "Invalid banner ID." });
    }


})

const deleteBanner = asyncHandler(async (req, res) => {

    await Banner.deleteOne({ _id: req.body.id })
    res.status(200).json({ 'message': 'successfully deleted banner.' });

})


const getBannerList = asyncHandler(async (req, res) => {

    var {
        search,
        limit,
        page
    } = req.body;
    var skip = (page - 1) * limit;

    var matchCondition = {}

    if (search != "" && search !=null) {
        matchCondition = {
            $or: [
                {
                    'bannerType': {
                        $regex:  search ,
                        $options: 'i'
                    }
                }, {
                    'offerStartRange': {
                        $regex:  search ,
                        $options: 'i'
                    }
                }, {
                    'offerEndRange': {
                        $regex:  search ,
                        $options: 'i'
                    }
                }
            ]
        }
    }


    const bannerDetails = await Banner.aggregate(
        [
            {
                $match: matchCondition
            }, {
                $facet: {
                    'data': [
                        {
                            $skip: skip,
                        }, {
                            $limit: limit
                        }
                    ],
                    totalCount: [
                        {
                            $count: 'count'
                        }
                    ]
                }
            }, {
                $project: {
                    'data.image': 1,
                    'data.startDate': 1,
                    'data.endDate': 1,
                    'data.bannerType': 1,
                    'data.isActive': 1,
                    'data._id': 1,
                    'totalCount': { $first: "$totalCount" }
                }
            }
        ]
    )



    res.status(200).json({ 'bannerList': bannerDetails, 'bannerDir': bannerDir })

})

const getSpecificBanner = asyncHandler(async (req, res) => {

    const bannerInfo = await Banner.findById(req.body.id)
    if (bannerInfo) {
        res.status(200).json(bannerInfo)
    } else {
        res.status(401).json({ 'message': 'Invalid banner info' })
    }

})

export {
    addBanner,
    changeBannerStatus,
    deleteBanner,
    getBannerList,
    getSpecificBanner
}