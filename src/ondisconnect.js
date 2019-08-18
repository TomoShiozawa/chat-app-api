const AWS = require("aws-sdk");
AWS.config.update({ region: process.env.AWS_REGION });
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context, callback) {
  var deleteParams = {
    TableName: process.env.CONNECTION_TABLE,
    Key: {
      connectionId: event.requestContext.connectionId,
    }
  };

  docClient.delete(deleteParams, function (err) {
    callback(null, {
      statusCode: err ? 500 : 200,
      body: err ? "Failed to disconnect: " + JSON.stringify(err) : "Disconnected."
    });
  });
}
