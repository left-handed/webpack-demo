if (typeof self === 'undefined') {
    global.self = {};
}
const fs = require("fs");
const path = require("path");
const express = require("express");
const {renderToString} = require("react-dom/server");
const SRR = require("../../dist/search-server.js");
const template = fs.readFileSync(path.join(__dirname, "../../dist/search.html"), "utf-8");
const data = require("./data.json");

const server = (prot) => {
    const app = express();
    // static 请求静态文件
    app.use(express.static('dist'));
    app.get('/serch', (req,res) => {
        const html = renderMarkup(renderToString(SRR));
        res.status(200).send(html);
    });
    app.listen(prot,() => {
        console.log(`Server is runing on port!${prot}`);
    });
}

server(process.env.PORT || 3000);

const renderMarkup = (tabStr) => {
    const strData = JSON.stringify(data);
    return  template.replace('<!--HTML_PLACEHOLDER-->', tabStr).replace('<!--INITIAL_DATA_PLACEHOLDER-->', `<script>window.__initial_data=${strData}</script>`);

    // return `!<!doctype html>
    //     <html lang="en">
    //     <head>
    //       <meta charset="UTF-8">
    //       <meta name="viewport"
    //             content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    //       <meta http-equiv="X-UA-Compatible" content="ie=edge">
    //       <title>Document</title>
    //     </head>
    //     <body>
    //         <div id="root">
    //             ${tabStr}
    //         </div>
    //     </body>
    // </html>`
}

