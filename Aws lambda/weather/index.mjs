import {
  SESClient,
  SendEmailCommand,
  VerifyEmailIdentityCommand,
  GetIdentityVerificationAttributesCommand,
} from "@aws-sdk/client-ses";
import {
  DynamoDBClient,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

const ses = new SESClient({ region: "eu-north-1" });
const db = new DynamoDBClient({ region: "eu-north-1" });

const WEATHER_API = "https://api.weatherapi.com/v1/current.json";
const WEATHER_API_KEY = "7aacc04ea876416f8d7170130250108";
const SOURCE_EMAIL = "sohammondal12345@gmail.com"; // Verified email

// Helper to get IST-equivalent time from UTC
function getTimeInTimezone(timezone) {
  try {
    const utcDate = new Date();

    const timeString = utcDate.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const dateString = utcDate.toLocaleDateString("en-CA", {
      timeZone: timezone,
    }); // yyyy-mm-dd

    return {
      time: timeString,       // "HH:mm"
      date: dateString,       // "YYYY-MM-DD"
    };
  } catch (err) {
    console.warn(`⚠️ Failed to resolve timezone: ${timezone}, defaulting to UTC`);
    const now = new Date();
    const hh = now.getUTCHours().toString().padStart(2, "0");
    const mm = now.getUTCMinutes().toString().padStart(2, "0");
    return {
      time: `${hh}:${mm}`,
      date: now.toISOString().split("T")[0],
    };
  }
}

export const handler = async () => {
  try {
    const scanResult = await db.send(
      new ScanCommand({
        TableName: "Users",
        FilterExpression: "subscribed = :val",
        ExpressionAttributeValues: {
          ":val": { BOOL: true },
        },
      })
    );

    const users = scanResult.Items || [];
    if (users.length === 0) {
      return {
        statusCode: 200,
        body: "No subscribed users found.",
      };
    }

    let verifiedCount = 0,
      verificationSent = 0,
      pendingCount = 0,
      skippedTime = 0;

    for (const user of users) {
      const email = user.email?.S;
      const city = user.city?.S || "Kolkata";
      const preferredTime = user.time?.S || "08:00"; // Default 8 AM
      const timezone = user.timezone?.S || "Asia/Kolkata"; // Default timezone

      if (!email) continue;

      const verificationSentFlag = user.verification_sent?.BOOL || false;

      const verifyStatus = await ses.send(
        new GetIdentityVerificationAttributesCommand({ Identities: [email] })
      );

      const status =
        verifyStatus.VerificationAttributes?.[email]?.VerificationStatus;

      if (status === "Success") {
        // ✅ Time check (native)
        const { time: currentTimeStr, date: currentDate } = getTimeInTimezone(timezone);

        if (currentTimeStr !== preferredTime) {
          console.log(
            `⏳ Skipping ${email} — Not preferred time: now=${currentTimeStr}, preferred=${preferredTime}`
          );
          skippedTime++;
          continue;
        }

        // ✅ Fetch weather
        const weatherRes = await fetch(
          `${WEATHER_API}?key=${WEATHER_API_KEY}&q=${city}`
        );
        const weather = await weatherRes.json();

        const subject = `🌦️ Weather Update for ${city} - ${currentDate}`;
        const iconUrl = `https:${weather.current.condition.icon}`;
        const htmlBody = `
        <html>
          <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; color: #333;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px;">
              <h2 style="text-align: center; color: #2c3e50;">🌤️ Weather Update for ${city}</h2>
              <hr />
              <div style="display: flex; align-items: center; justify-content: center;">
                <img src="${iconUrl}" alt="Weather icon" style="width: 80px; margin-right: 20px;" />
                <div>
                  <h3 style="margin: 0;">${weather.current.condition.text}</h3>
                  <p style="margin: 5px 0;">📍 ${weather.location.name}, ${weather.location.country}</p>
                  <p style="margin: 5px 0;">📅 ${currentDate}</p>
                </div>
              </div>
              <hr />
              <table style="width: 100%; text-align: center; margin-top: 20px;">
                <tr>
                  <td>🌡️ <strong>Temperature</strong></td>
                  <td>${weather.current.temp_c}°C</td>
                </tr>
                <tr>
                  <td>💧 <strong>Humidity</strong></td>
                  <td>${weather.current.humidity}%</td>
                </tr>
                <tr>
                  <td>🌬️ <strong>Wind</strong></td>
                  <td>${weather.current.wind_kph} kph</td>
                </tr>
                <tr>
                  <td>☀️ <strong>UV Index</strong></td>
                  <td>${weather.current.uv}</td>
                </tr>
              </table>
              <hr />
              <p style="text-align: center; color: #888;">Stay prepared and enjoy your day! 🌈</p>
              <p style="text-align: center; font-size: 0.9em; color: #aaa;">~ Weatherly Daily</p>
            </div>
          </body>
        </html>
        `;

        await ses.send(
          new SendEmailCommand({
            Destination: { ToAddresses: [email] },
            Message: {
              Subject: { Data: subject },
              Body: { Html: { Data: htmlBody } },
            },
            Source: SOURCE_EMAIL,
          })
        );
        console.log(`✅ Sent weather update to ${email}`);
        verifiedCount++;
      } else if (!verificationSentFlag) {
        await ses.send(new VerifyEmailIdentityCommand({ EmailAddress: email }));
        await db.send(
          new UpdateItemCommand({
            TableName: "Users",
            Key: { email: { S: email } },
            UpdateExpression: "SET verification_sent = :val",
            ExpressionAttributeValues: {
              ":val": { BOOL: true },
            },
          })
        );
        console.log(`📩 Sent verification email to ${email}`);
        verificationSent++;
      } else {
        console.log(`⏳ Waiting for ${email} to verify.`);
        pendingCount++;
      }
    }

    return {
      statusCode: 200,
      body: `✅ Sent: ${verifiedCount}, 📩 Verifications: ${verificationSent}, ⏳ Pending: ${pendingCount}, ⏰ Skipped (wrong time): ${skippedTime}`,
    };
  } catch (err) {
    console.error("❌ Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
