import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const slackTimestamp = request.headers.get('x-slack-request-timestamp');
  const slackSignature = request.headers.get('x-slack-signature');
  const signingSecret = process.env.SLACK_SIGNING_SECRET;

  // Verify Slack signature
  if (signingSecret && slackTimestamp && slackSignature) {
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - Number(slackTimestamp)) > 60 * 5) {
      return NextResponse.json(
        { error: 'Request timestamp too old' },
        { status: 401 }
      );
    }

    const baseString = `v0:${slackTimestamp}:${rawBody}`;
    const mySignature =
      'v0=' +
      crypto
        .createHmac('sha256', signingSecret)
        .update(baseString)
        .digest('hex');

    if (mySignature !== slackSignature) {
      return NextResponse.json(
        { error: 'Invalid Slack signature' },
        { status: 401 }
      );
    }
  }

  // Forward to backend (signature already verified)
  try {
    const backendUrl = process.env.APP_SERVICE_URL || 'http://localhost:8000';
    const response = await fetch(
      `${backendUrl}/api/app-service/v1/chat/webhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: rawBody,
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to forward request' },
      { status: 500 }
    );
  }
}
