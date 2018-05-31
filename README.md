# Pulumi IO| integration

This pacakge provides IO| integration with Pulumi programs.  When imported into a Pulumi program, any serverless
functions generated from JavaScript callbacks in the Pulumi program will automatically be wrapped with IO|.  

```javascript
const aws = require("@pulumi/aws");
const serverless = require("@pulumi/aws-serverless");

// Load the Pulumi IO| integration package
require("pulumi-iopipe");

// Create a bucket and a function to log new object uploads
const bucket = new aws.s3.Bucket("my-bucket");
serverless.bucket.onPut("onNewObject", bucket, async (ev) => console.log(ev));
exports.bucketName = bucket.bucket;
```