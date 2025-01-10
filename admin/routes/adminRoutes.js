import express from 'express'
const router = express.Router()

import {
    adminSettings,
    addEditAdminSettings,
    uploadSiteLogo,
    dashboard,
    generalReport,
    updatePaymentSettings,
    getPaymentSettings
} from '../controllers/adminSettingsController.js'

import {

    displaySubadmin,
    addSubadmin,
    deletesubAdmin,
    changeStatusSubAdmin,
    getAdmindetails,
    sendForgotPassword,
    authAdmin,
    changeSubAdminStatus

} from '../controllers/subAdminController.js'

import {
    addBanner,
    changeBannerStatus,
    deleteBanner,
    getBannerList,
    getSpecificBanner
} from '../controllers/bannerController.js'



import {
    displayUserList,
    addEditUser,
    changeUserStatus
} from '../controllers/userController.js'



import {
    displayTemplatesList,
    addEditEmailTemplates,
} from '../controllers/emailTemplatesController.js'

import {
    displayCmsPage,
    addCmsPage,
    statusChangeCmsPage,
    getcmsDetails
} from '../controllers/cmsControllers.js';



// AdminSetting 
router.post('/adminsettings', adminSettings)
router.post('/addeditadminsettings', addEditAdminSettings)
router.post('/uploadsitelogo', uploadSiteLogo)

// Dashboard

router.post('/dashboard', dashboard)
router.post('/generalreport', generalReport)


// Subadmin 
router.post('/authadmin', authAdmin)
router.post('/displaySubAdmin', displaySubadmin)
router.post('/getadmindetails', getAdmindetails)
router.post('/addSubadmin', addSubadmin)
router.post('/changesubadminstatus', changeSubAdminStatus)
router.post('/deleteSubadmin', deletesubAdmin)
router.post('/changeStatus', changeStatusSubAdmin)
router.post('/sendforgotpassword', sendForgotPassword)

// Banner 
router.post('/addbanner', addBanner)
router.post('/changebannerstatus', changeBannerStatus)
router.post('/deletebanner', deleteBanner)
router.post('/displaybannerlist', getBannerList)
router.post('/getspecifibanner', getSpecificBanner)

// User 

router.post('/displayuserlist', displayUserList)
router.post('/addedituser', addEditUser)
router.post('/changeuserstatus', changeUserStatus)


// Payment Settings

router.post('/updatePaymentSettings', updatePaymentSettings);
router.post('/getpaymentsettings', getPaymentSettings)



// Email templates

router.post('/displayemailtemplateslist', displayTemplatesList)
router.post('/addeditemailtemplates', addEditEmailTemplates)

// CMS PAGES

router.post('/displaycmspages', displayCmsPage)
router.post('/addnewcmspage', addCmsPage)
router.post('/changestatuscms', statusChangeCmsPage)
router.post('/getcmsinfo', getcmsDetails)


export default router