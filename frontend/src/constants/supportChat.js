export const SUPPORT_CHAT_OPEN_EVENT = 'murplace:support-chat-open'

export function requestSupportChatOpen() {
	if (typeof window === 'undefined') return
	window.dispatchEvent(new CustomEvent(SUPPORT_CHAT_OPEN_EVENT))
}
