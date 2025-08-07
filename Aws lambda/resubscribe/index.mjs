import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" });

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Preflight OK" }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { email } = body;

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Email is required." }),
      };
    }

    // Fetch the user
    const getCommand = new GetItemCommand({
      TableName: "Users",
      Key: {
        email: { S: email }
      }
    });

    const result = await client.send(getCommand);

    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "User not found." }),
      };
    }

    // Update subscription to true
    const updateCommand = new UpdateItemCommand({
      TableName: "Users",
      Key: {
        email: { S: email }
      },
      UpdateExpression: "SET subscribed = :val",
      ExpressionAttributeValues: {
        ":val": { BOOL: true }
      }
    });

    await client.send(updateCommand);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "User successfully resubscribed." }),
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Internal server error",
        error: err.message,
      }),
    };
  }
}
