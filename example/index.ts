const pulumi = require('@pulumi/pulumi')
const aws = require('@pulumi/aws')
const serverless = require('@pulumi/aws-serverless')

// Load the Pulumi IO| integration package
require('@pulumi/iopipe')(pulumi)


const hello = new aws.serverless.Function('hello', {
    func() {
        console.log('hello')
        return {
            statusCode: 200,
            body: JSON.stringify('hello')
        }
    },
    policies: ['arn:aws:iam::aws:policy/AWSLambdaFullAccess']
})


const api = new serverless.apigateway.API('api', {
    routes: [
        {method: 'GET', path: '/hello', handler: hello.lambda}
    ]
})


// Create a bucket and a function to log new object uploads
const bucket = new aws.s3.Bucket('my-bucket')
serverless.bucket.onPut('onNewObject', bucket, async (ev) => console.log(ev))
exports.bucketName = bucket.bucket
