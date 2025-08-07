import {
  DynamoDBClient,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";

import {
  SESClient,
  VerifyEmailIdentityCommand,
} from "@aws-sdk/client-ses";

const db = new DynamoDBClient({ region: "eu-north-1" });
const ses = new SESClient({ region: "eu-north-1" });

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
      body: JSON.stringify({ message: "CORS preflight success" }),
    };
  }

  const body = JSON.parse(event.body || '{}');
  const { email, password, city, frequency, time } = body;

  if (!email || !password || !city || !frequency || !time) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "All fields are required" }),
    };
  }

  try {
    // ✅ Step 1: Save user in DynamoDB
    await db.send(new PutItemCommand({
      TableName: "Users",
      Item: {
        email: { S: email },
        password: { S: password },
        city: { S: city },
        frequency: { S: frequency },
        time: { S: time },
        subscribed: { BOOL: true },
        verification_sent: { BOOL: false },  // Always starts false
      },
      ConditionExpression: 'attribute_not_exists(email)',
    }));

    // ✅ Step 2: Send SES verification email
    try {
      await ses.send(new VerifyEmailIdentityCommand({ EmailAddress: email }));
      console.log(`📩 Verification email sent to ${email}`);
    } catch (sesErr) {
      console.error(`⚠️ Failed to send verification email to ${email}: ${sesErr.message}`);
      // Still allow signup to succeed
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "User registered. Verification email sent via SES (if not already).",
      }),
    };

  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "User already exists" }),
      };
    }

    console.error("❌ Signup error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Signup failed", error: err.message }),
    };
  }
}
