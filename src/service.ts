import dotenv from "dotenv";
dotenv.config();
import sgMail, { MailDataRequired } from "@sendgrid/mail";
import express, { Request, Response } from "express";
const fs = require('fs');


interface UserData {
    email: string,
    name: string,
    status: string,
    type?: Type
}

enum Type {
    BCC = 'bcc',
    CC = 'cc',
    TO = 'To'
}

interface Attachment {
    fileName: any,
    path: string
}

interface User {
    userData: UserData[],
    emailMessage: string,
    attachments?: Attachment
}

const sendEmail = (req: Request, res: Response) => {
    const userDetails: User = {
        userData: [
            {
                email: 'amrit@beamax.io',
                name: 'Amrit',
                status: 'Pass',
                type: Type.BCC
            },
            {
                email: 'amrit@globalshala.com',
                name: 'Amrit',
                status: 'Pass',
                type: Type.CC
            },
            {
                email: 'amritkumar19352005@gmail.com',
                name: 'Amrit',
                status: 'Pass',
                type: Type.TO
            }
        ],
        emailMessage: "Email send from SendGrid",
        attachments: {
            fileName: 'Logo.png',
            path: './Logo.png'
        }
    }

    // Here we check for a valid API key
    const apiKey = process.env.SENDGRID_API_KEY;
    // console.log(apiKey);
    if (!apiKey) {
        console.error("Missing SendGrid Key");
        process.exit(1);
    }

    // Here we check for a valid from address
    const fromAddress = process.env.SENDGRID_FROM;
    if (!fromAddress) {
        console.error("Missing sender email address!");
        process.exit(1);
    }
    // Here we set the SendGrid API key
    sgMail.setApiKey(apiKey);

    // Here we check for the mail subject, but if it is missing
    // we do not need to exit. Instead we use a fallback value.
    const subjectValue = process.env.MAIL_SUBJECT || "Fallback value - check your env!";

    const attachedFile = fs.readFileSync(`${__dirname}/Logo.png`).toString("base64");

    let successEmails: string[] = [];
    let failureEmials: string[] = [];

    for (const user of [userDetails]) {
        for (let i = 0; i < user.userData.length; i++) {

            successEmails.push(user.userData[i].email);
            failureEmials.push(user.userData[i].email);

            const message: MailDataRequired = {
                to: user.userData[i].email,
                from: fromAddress,
                subject: subjectValue,
                html: `Hi  ${user.userData[i].name}, <b>Your result is ${user.userData[i].status}</b>.`,
                attachments: [
                    { content: attachedFile, filename: user.attachments?.fileName }
                ]
            }

            // Here we send the message we just constructed!
            sgMail.send(message)
                .then(() => {
                    // Here we log successful send requests
                    console.info(`Message send success: ${user.userData[i].email}`)
                }).catch((err) => {
                    // Here we log errored send requests
                    console.error(err);
                    console.error(`Message send failed: ${user.userData[i].email}`)
                });

        }
        console.log(user);

    }
    res.status(200).json({
        status: 200,
        message: 'Email send Successfully!',
        data: {
            success: [...successEmails],
            failure: [...failureEmials]
        }
    });
};

const app = express();
const port = process.env.PORT;

app.get('/', (req: Request, res: Response) => {
    res.send('Server Connected Successfully!')
});

app.get('/sendEmails', sendEmail);


app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});