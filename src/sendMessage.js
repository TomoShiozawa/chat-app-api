const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

const { CONNECTION_TABLE } = process.env;

exports.handler = async (event, context) => {
  let connectionData;
  const roomName = JSON.parse(event.body).roomName;

  try {
    connectionData = await docClient.query(
      {
        TableName: CONNECTION_TABLE,
        KeyConditionExpression: '#roomName= :roomName',
        ExpressionAttributeNames:{'#roomName': 'roomName'},
        ExpressionAttributeValues:{':roomName': roomName},
      }
    ).promise();
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });

  const postData = JSON.parse(event.body).data;

  const postCalls = connectionData.Items.map(async (connection) => {
    try {
      await apigwManagementApi.postToConnection({ ConnectionId: connection.connectionId, Data: postData }).promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connection.connectionId}`);
        await docClient.delete({ TableName: CONNECTION_TABLE, Key: { roomName: roomName, connectionId: connection.connectionId } }).promise();
      } else {
        throw e;
      }
    }
  });

  try {
    await Promise.all(postCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  return { statusCode: 200, body: 'Data sent.' };
};