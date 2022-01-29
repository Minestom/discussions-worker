import * as crypto from 'crypto';
import { Buffer } from 'buffer';
import {DWebhookPayload} from './discord';
import {GHDiscussionEvent} from './github';

// Secrets
declare const WEBHOOK_URL: string
declare const WEBHOOK_SECRET: string

export async function handleRequest(request: Request): Promise<Response> {
    const {method, headers} = request;
    const contentType = headers.get("content-type") || "";
    const secret = headers.get("X-Hub-Signature-256") || "";

    // Ignore non json messages or non post requests.
    if (method !== 'POST')
        return new Response(null, {status: 404});
    if (!contentType.includes("application/json"))
        return new Response(null, {status: 400, statusText: "Content must be application/json"});

    // Verify the secret provided by Github
    const requestBody = await request.text();
    const sig = Buffer.from(secret, 'utf8').toString();
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const digest = Buffer.from('sha256=' + hmac.update(requestBody).digest('hex'), 'utf8').toString();
    if (sig.length !== digest.length || digest !== sig) {
        return new Response(null, {status: 401});
    }

    // If not a `created` event in `Help` then discard
    const {action, discussion, sender} = JSON.parse(requestBody) as GHDiscussionEvent;
    if (action !== 'created' || discussion.category.name !== 'Help')
        // Do nothing for other events
        return new Response();

    // Create discord webhook payload (the embed)
    const payload: DWebhookPayload = {
        embeds: [{
            type: 'rich',
            title: discussion.title,
            description: discussion.body.substring(0, 3500),
            url: discussion.html_url,
            timestamp: discussion.created_at,
            author: {
                name: sender.login,
                url: sender.html_url,
                icon_url: sender.avatar_url
            }
        }]
    }

    // Send webhook
    await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    // Respond 200
    return new Response();
}
