import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" });

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Preflight OK" })
    };
  }

  const body = JSON.parse(event.body || '{}');
  const { email, password } = body;

  if (!email || !password) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Email and password required" }),
    };
  }

  try {
    const command = new GetItemCommand({
      TableName: "Users",
      Key: { email: { S: email } }
    });

    const result = await client.send(command);
    const item = result.Item;

    if (!item || item.password.S !== password) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Invalid credentials" }),
      };
    }

    // ✅ Extract all fields
    const userData = {
      email: item.email?.S || '',
      password: item.password?.S || '',
      city: item.city?.S || '',
      frequency: item.frequency?.S || '',
      time: item.time?.S || '',
      subscribed: item.subscribed?.BOOL ?? true
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Login successful",
        token: "mock-token-123",
        user: userData // ✅ Send full user data
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
}
