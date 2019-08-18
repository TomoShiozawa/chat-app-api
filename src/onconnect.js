const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION });
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context, callback) {
  var putParams = {
    TableName: process.env.CONNECTION_TABLE,
    Item: {
      roomName: event.queryStringParameters.roomName,
      connectionId: event.requestContext.connectionId,
    }
  };

  docClient.put(putParams, function (err) {
    callback(null, {
      statusCode: err ? 500 : 200,
      body: err ? "Failed to connect: " + JSON.stringify(err) : "Connected."
    });
  });
};