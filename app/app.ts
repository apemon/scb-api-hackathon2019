import express = require("express");
import 'dotenv/config';
import { RSA_PKCS1_OAEP_PADDING } from "constants";
import * as rp from 'request-promise-native';
const fs = require('fs');
const cors = require('cors');
const uuidv4 = require('uuid/v4');

const port = process.env.PORT || 8080;
const app: express.Application = express();

app.use(express.urlencoded());
app.use(cors());

interface authenHeader {
    contentType: string,
    resourceOwnerId: string,
    requestUId: string,
    acceptLanguage: string,
    channel?: string,
    authorization?: string
}

async function AuthenV1():Promise<any>  {
    let header: authenHeader = {
        acceptLanguage: 'EN',
        contentType: 'application/json',
        requestUId: 'XXX',
        resourceOwnerId: 'XXX'
    }
    let body:any = {
        applicationKey: process.env.appKey,
        applicationSecret: process.env.appSecret
    }
    console.log(body)
    let options = {
        headers: header,
        body: body,
        json: true
    }
    let response:any = await rp.post('https://api.partners.scb/partners/sandbox/v1/oauth/token',options)
    return response;
}

app.get("/pay/:amount", async (req, res) => {
    // authenticate
    let authResponse = await AuthenV1();
    let token:string = '';
    if(authResponse.status.code == 1000) {
        token = authResponse.data.accessToken;
    }
    console.log(token);
    // generate deeplink
    let requestId = uuidv4();
    let header: authenHeader = {
        requestUId: requestId,
        authorization: 'Bearer ' + token,
        acceptLanguage: 'EN',
        resourceOwnerId: process.env.appKey,
        contentType: 'application/json',
        channel: 'scbeasy'
    };
    let body:any = {
        paymentAmount: req.params.amount,
        transactionType: 'PAYMENT',
        transactionSubType: 'BPA',
        ref1: '1101213202',
        ref2: '21211212',
        accountTo: process.env.billerId,
        merchantMetaData: {
            paymentInfo: [
                {
                    type: "TEXT_WITH_IMAGE",
                    title: "salted egg",
                    header: "Hello world",
                    description: "just a salted egg",
                    imageUrl: "https://www.rotinrice.com/wp-content/uploads/2012/04/SaltedEggs-1.jpg"
                }
            ],
            analytics: {}
        }
    };
    let options:any = {
        body: body,
        headers: header,
        json: true
    }
    let response:any = await rp.post('https://api.partners.scb/partners/sandbox/v2/deeplink/transactions', options);
    //let deeplink:string = response.data.deeplinkUrl + '?callback_url=' + process.env.callback + '/' + response.data.transactionId;
    return res.send(response.data.deeplinkUrl);
});

app.post('/callback/:tx' , (req,res) => {
    console.log('hello');
    console.log(req.body);
    return res.send('hello');
});

app.listen(port, () => {
    
});