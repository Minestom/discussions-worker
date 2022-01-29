export interface DWebhookPayload {
    username?: string,
    content?: string,
    embeds?: DEmbed[],
    flags?: number
}

export interface DEmbed {
    type: 'rich',
    title?: string,
    description?: string,
    url?: string,
    timestamp?: string,
    color?: number,
    author?: {
        name?: string,
        url?: string,
        icon_url?: string,
    },
    footer?: {
        text?: string
    }
}
