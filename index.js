const AWS = require('aws-sdk');
const express = require('express');
const cors = require('cors')
const Jimp = require('jimp');
const notContainsObject = require('./utils')
const app = express();
const dotenv = require('dotenv');
dotenv.config();

app.use(cors())

app.use(express.raw({
    type:"*/*",
    limit: process.env.IMAGE_LIMIT
}))


const s3 = new AWS.S3({
    accessKeyId: process.env.ID,
    secretAccessKey: process.env.SECRET
});

const params = {
    Bucket: process.env.BUCKET_NAME,
    CreateBucketConfiguration: {
        LocationConstraint: "eu-central-1"
    }
};

const uploadFile = (fileName, bufferData) => {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: bufferData
    };

    s3.upload(params, function (err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
    });
};




app.post('/:filename', async function (req, res) {
    let fileName = decodeURIComponent(req.params.filename), 
        file = req.body,
        contentType = req.headers['content-type'];
    if(notContainsObject(contentType, ['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/tiff'])) {
        uploadFile(fileName,file)
        res.json("NOT IMAGE, BUT OK").end()
        return;
    }
    try{
      Jimp.read(file, (err, input) => {
        if(err) throw err;
        let input2048 = input.clone(),input1024 = input.clone(), input300 = input.clone();

        input2048.resize(2048, 2048);
        input2048.getBuffer(Jimp.AUTO, (err, output) => {
          if(err) throw err;
          uploadFile('2048' + '-' + fileName+'.'+contentType.split('/')[1], output);
        })

        input1024.resize(1024, 1024);
        input1024.getBuffer(Jimp.AUTO, (err, output) => {
          if(err) throw err;
            uploadFile('1024' + '-' + fileName+'.'+contentType.split('/')[1], output);
        })

        input300.resize(300, 300);
        input300.getBuffer(Jimp.AUTO, (err, output) => {
          if(err) throw err;
            uploadFile('300' + '-' + fileName+'.'+contentType.split('/')[1], output);
        })
      })
    }catch(err){
      res.status(400).send(`Error: ${err.message}`);
    }
    res.json("image, great, successfully uploaded to AWS S3, OK!").end()
})



app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}!`)
});