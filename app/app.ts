import express = require("express");
import { RSA_PKCS1_OAEP_PADDING } from "constants";
const request = require("request-promise");

const app: express.Application = express();

app.use(express.urlencoded());

interface authenHeader {
    contentType: string,
    resourceOwnerId: string,
    requestUId: string,
    acceptLanguage: string
}

app.get("/payment", (req, res) => {
    let header: authenHeader = {
        acceptLanguage: 'EN',
        contentType: 'application/json',
        requestUId: 'XXX',
        resourceOwnerId: 'XXX'
    }
    let options = {
        method: 'POST',
        uri: 'https://api.partners.scb/partners/sandbox/v1/oauth/token',
        body: {
            applicationKey: 'l7af85500de83b425aa29621a24dd59bb8',
            applicationSecret: '181e3f00bcde4ba3a09ca1b8030abd59'
        },
        json: true,
        headers: header
    }
    request(options).then((result) => {
        return res.send(result.data.accessToken);
    }).catch((err) => {
        return res.send(err);
    })
});

app.listen(9000, () => {

});