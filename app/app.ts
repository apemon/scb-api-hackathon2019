import express = require("express");
import { RSA_PKCS1_OAEP_PADDING } from "constants";
import * as rp from 'request-promise-native';
const fs = require('fs');

let raw = fs.readFileSync('.secret');
let config = JSON.parse(raw);
const app: express.Application = express();

app.use(express.urlencoded());

interface authenHeader {
    contentType: string,
    resourceOwnerId: string,
    requestUId: string,
    acceptLanguage: string
}

async function AuthenV1():Promise<any>  {
    let header: authenHeader = {
        acceptLanguage: 'EN',
        contentType: 'application/json',
        requestUId: 'XXX',
        resourceOwnerId: 'XXX'
    }
    let body:any = {
        applicationKey: config.appKey,
        applicationSecret: config.appSecret
    }
    let options = {
        headers: header,
        body: body,
        json: true
    }
    let response:any = await rp.post('https://api.partners.scb/partners/sandbox/v1/oauth/token',options)
    return response;
}

app.get("/pay/:amount", async (req, res) => {
    let authResponse = await AuthenV1();
    let token:string = '';
    if(authResponse.status.code == 1000) {
        token = authResponse.data.accessToken;
    }
    return res.send(token);
});

app.listen(9000, () => {

});