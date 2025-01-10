import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import cmsPage from '../../models/cmsModel.js'
import slugify from 'slugify'




/* display CMS page */

const displayCmsPage = asyncHandler(async (req, res) => {

  var {
    page,
    limit,
    search
  } = req.body;

  var skip = (page - 1) * limit;

  var matchCondition = {};
  if (search != null && search != "") {
    matchCondition = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { footerType: { $regex: search, $options: "i" } }
      ]
    };
  }

  const emailtemplatesList = await cmsPage.aggregate([
    {
      $match: matchCondition
    }, {
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
        'data.title': 1,
        'data._id': 1,
        'data.footerType': 1,
        'data.isActive': 1,
        'data.content': 1,
        'totalCount': {
          $first: '$totalCount'
        }
      }
    }
  ])
  res.status(200).json({ 'cmsDetailsList': emailtemplatesList })

})

/**  Add cms Page  */
const addCmsPage = asyncHandler(async (req, res) => {

  var {
    id,
    title,
    content,
    footerType
  } = req.body;


  if (id != null) {
    const cmsPageExist = await cmsPage.findOne({
      'title': title,
      _id: { $ne: id }
    })
    if (cmsPageExist == null) {
      const cmsDetails = await cmsPage.findById(id)
      cmsDetails.title = title
      cmsDetails.content = content
      cmsDetails.footerType = footerType
      cmsDetails.slug = slugify(title);
      await cmsDetails.save()
      res.status(200).json({ 'status': 1, 'message': 'Successfully updated.' })
    } else {
      res.status(401).json({ "message": 'CMS title already exists', 'status': 0 })
    }
  } else {

    const cmsDetails = await cmsPage.findOne({ title: title });

    if (cmsDetails) {

      res.status(200).json({ 'status': 0, 'message': 'CMS Page already exists' })

    } else {

      await cmsPage.create({
        title: title,
        content: content,
        footerType: footerType,
        slug: slugify(title),
      })

      res.status(200).json({ 'status': 1, 'message': 'Successfully created.' })

    }

  }

})




/* chage status */
const statusChangeCmsPage = asyncHandler(async (req, res) => {
  const cmsData = await cmsPage.findById(req.body.id)
  if (cmsData) {
    cmsData.isActive = req.body.status;
    await cmsData.save()
    res.status(200).json({ "message": 'successfully change status', 'status': 1 })
  } else {
    res.status(200).json({ "message": 'Invalid CMS details', 'status': 0 })
  }
})




const getcmsDetails = asyncHandler(async (req, res) => {

  const cmsDetails = await cmsPage.findById(req.body.id).select('-slug -isActive')

  if (cmsDetails) {
    var data = {};
    data['cmsdetails'] = cmsDetails
    res.status(200).json(data)

  } else {
    res.status(401).json({ "message": "Invalid CMS details" })
  }

})




export {

  displayCmsPage,
  addCmsPage,
  statusChangeCmsPage,
  getcmsDetails

}