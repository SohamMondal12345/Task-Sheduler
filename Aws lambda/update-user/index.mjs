import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" });

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: JSON.stringify({ message: "Preflight OK" }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { email, city, time } = body;

    if (!email || !city || !time) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Email, city, and time are required." }),
      };
    }

    const updateCommand = new UpdateItemCommand({
      TableName: "Users",
      Key: { email: { S: email } },
      UpdateExpression: "SET city = :city, #t = :time",
      ExpressionAttributeNames: {
        "#t": "time"
      },
      ExpressionAttributeValues: {
        ":city": { S: city },
        ":time": { S: time }
      }
    });

    await client.send(updateCommand);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "User details updated successfully." }),
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal server error", error: err.message }),
    };
  }
}
