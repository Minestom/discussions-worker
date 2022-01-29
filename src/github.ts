export interface GHDiscussionEvent {
    action: string,
    discussion: {
        html_url: string,
        title: string,
        body: string,
        created_at: string,
        category: {
            emoji: string,
            name: string,
        }
    },
    sender: {
        html_url: string,
        login: string,
        avatar_url: string,
    }
}
