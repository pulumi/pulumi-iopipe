"use strict";
const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");
const serverless = require("@pulumi/aws-serverless");

const origSerializeFunctionAsync = pulumi.runtime.serializeFunctionAsync;
pulumi.runtime.serializeFunctionAsync = async function(func, serialize) {
    const str = await origSerializeFunctionAsync(func, serialize);
    const lines = str.split("\n");
    const config = new pulumi.Config("iopipe");
    const token = config.require("token")
    lines[0] = `exports.handler = require("@iopipe/iopipe")({token: "${token}"})(__f0);`;
    return lines.join("\n");
}

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("my-bucket");

serverless.bucket.onPut("onNewFile", bucket, (ev, cts, cb) => {
    console.log(ev);
    cb(null);
});

// Export the DNS name of the bucket
exports.bucketName = bucket.bucket;
