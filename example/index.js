const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");
const serverless = require("@pulumi/aws-serverless");

// Load the Pulumi IO| integration package
require("@pulumi/iopipe")(pulumi);

// Create a bucket and a function to log new object uploads
const bucket = new aws.s3.Bucket("my-bucket");
//serverless.bucket.onPut("onNewObject", bucket, async (ev) => console.log(ev));

let f = new aws.serverless.Function("f", {
    policies: [aws.iam.AWSLambdaFullAccess],
    factoryFunc: () => {
        console.log("booting!");
        return async (ev) => {
            console.log("factoryFunc")
            console.log(ev);
        }
    },
})
serverless.bucket.onPut("onNewObject2", bucket, f.lambda);
exports.bucketName = bucket.bucket;

const hello = new aws.serverless.Function('hello', {
    func: (event1, context, cb) => {
        console.log(event1)
        cb(null, {
            statusCode: 200,
            body: "Hello world",
        });
    },
    policies: ['arn:aws:iam::aws:policy/AWSLambdaFullAccess']
})

const api = new serverless.apigateway.API('api', {
    routes: [
        {method: 'GET', path: '/hello', handler: hello.lambda}
    ]
})

exports.endpoint = api.url;