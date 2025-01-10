import nodeMailer from 'nodemailer'
import dotenv from 'dotenv'
import fs from 'fs'
import asyncHandler from 'express-async-handler'
dotenv.config()

export const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
     auth: {
         user: 'xxx@gmail.com',
         pass: 'xxxxxxxxxx'
     }
  /*   host: process.env.SMTPHOST,
    port: process.env.SMTPPORT,
    secure: true,
    auth: {
        user: process.env.SMTPMAIL,
        pass: process.env.SMTPPASS
    } */

})
export const adminEmail = process.env.ADMINMAIL
export const adminEmailName = process.env.SITENAME

export async function commonSendMail(mailOptions) {

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
            return false;

        } else {
            console.log('Email sent: ' + info.response)
            return true;

        }
    })

}
export function readHTMLFile(path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {

        if (err) {
            console.log(err)
            callback(err);
            throw err;

        }
        else {
            /* console.log(html) */
            callback(null, html);
        }
    });
};
export async function createEmailFile(path, html, callback) {
    console.log(html)
    fs.writeFile(path, html, function (err) {
        if (err) {
            console.log(err)
            callback(err);
            throw err;

        }
        else {
            console.log(html)
            callback(null, html);
        }

    });

};
