import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import config from '../config.js'
import { useLang } from '../i18n.jsx'
import { AUTH_CHANGED_EVENT } from '../constants/authEvents'
import { SUPPORT_CHAT_OPEN_EVENT } from '../constants/supportChat'

const OPEN_STATE = 'open'
const CONNECTING_STATE = 'connecting'
const CLOSED_STATE = 'closed'
const SIGNED_OUT_STATE = 'signed-out'

function getAuthToken() {
	return localStorage.getItem('token') || ''
}

function buildSocketUrl(token) {
	const socketPath = config.supportChatWsUrl || '/ws/support/'
	const url = new URL(socketPath, window.location.origin)

	if (url.protocol === 'http:' || url.protocol === 'https:') {
		url.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
	}

	if (token) {
		url.searchParams.set('token', token)
	}

	return url.toString()
}

function makeMessageId(prefix = 'msg') {
	return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function pickMessageText(payload) {
	if (typeof payload === 'string') return payload
	if (!payload || typeof payload !== 'object') return ''

	return payload.text || payload.content || payload.message || payload.body || ''
}

function normalizeMessage(payload, fallbackRole = 'support') {
	if (typeof payload === 'string') {
		return {
			id: makeMessageId('text'),
			role: fallbackRole,
			text: payload,
			createdAt: new Date().toISOString(),
			status: 'sent'
		}
	}

	if (!payload || typeof payload !== 'object') return null

	const text = pickMessageText(payload)
	if (!text && !Array.isArray(payload.messages)) return null

	const role = payload.role === 'user' || payload.from === 'user' || payload.sender === 'user'
		? 'user'
		: payload.role === 'support' || payload.from === 'support' || payload.sender === 'support'
			? 'support'
			: fallbackRole

	return {
		id: payload.id || payload.message_id || payload.client_message_id || makeMessageId(role),
		clientMessageId: payload.client_message_id,
		role,
		text,
		createdAt: payload.created_at || payload.createdAt || new Date().toISOString(),
		status: payload.status || (payload.pending ? 'sending' : 'sent')
	}
}

function normalizeHistory(payload) {
	if (Array.isArray(payload)) {
		return payload.map(item => normalizeMessage(item)).filter(Boolean)
	}

	if (!payload || typeof payload !== 'object') return []

	const candidateLists = [payload.messages, payload.history, payload.items, payload.results]
	for (const list of candidateLists) {
		if (Array.isArray(list)) {
			return list.map(item => normalizeMessage(item)).filter(Boolean)
		}
	}

	const single = normalizeMessage(payload)
	return single ? [single] : []
}

function formatMessageTime(value) {
	if (!value) return ''
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return ''
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getConnectionLabel(state, t) {
	if (state === OPEN_STATE) return t('support.chat.connected') || 'Connected'
	if (state === CONNECTING_STATE) return t('support.chat.connecting') || 'Connecting...'
	if (state === SIGNED_OUT_STATE) return t('support.chat.sign_in') || 'Sign in to open support chat'
	return t('support.chat.disconnected') || 'Offline'
}

export default function SupportChat() {
	const navigate = useNavigate()
	const { t } = useLang()
	const [token, setToken] = useState(() => getAuthToken())
	const [isOpen, setIsOpen] = useState(false)
	const [messages, setMessages] = useState([])
	const [draft, setDraft] = useState('')
	const [status, setStatus] = useState(token ? CLOSED_STATE : SIGNED_OUT_STATE)
	const [error, setError] = useState('')
	const [unreadCount, setUnreadCount] = useState(0)
	const socketRef = useRef(null)
	const messagesEndRef = useRef(null)
	const inputRef = useRef(null)

	const isAuthenticated = Boolean(token)
	const headerLabel = useMemo(() => getConnectionLabel(status, t), [status, t])

	useEffect(() => {
		const syncAuth = () => {
			const nextToken = getAuthToken()
			setToken(nextToken)
			if (!nextToken) {
				setIsOpen(false)
				setStatus(SIGNED_OUT_STATE)
				setUnreadCount(0)
				setMessages([])
			}
		}

		window.addEventListener('storage', syncAuth)
		window.addEventListener(AUTH_CHANGED_EVENT, syncAuth)
		return () => {
			window.removeEventListener('storage', syncAuth)
			window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth)
		}
	}, [])

	useEffect(() => {
		const handleOpenRequest = () => {
			if (!getAuthToken()) {
				navigate('/login', { state: { from: '/support' } })
				return
			}

			setIsOpen(true)
			setUnreadCount(0)
		}

		window.addEventListener(SUPPORT_CHAT_OPEN_EVENT, handleOpenRequest)
		return () => window.removeEventListener(SUPPORT_CHAT_OPEN_EVENT, handleOpenRequest)
	}, [navigate])

	useEffect(() => {
		if (!isOpen || !token) {
			return undefined
		}

		const socketUrl = buildSocketUrl(token)
		const socket = new WebSocket(socketUrl)
		socketRef.current = socket
		setError('')
		setStatus(CONNECTING_STATE)

		socket.onopen = () => {
			setStatus(OPEN_STATE)
			try {
				socket.send(JSON.stringify({ type: 'auth', token }))
			} catch (sendError) {
				setError(sendError?.message || t('support.chat.connection_error') || 'Unable to connect to support chat')
			}
		}

		socket.onmessage = (event) => {
			let payload = event.data
			if (typeof payload === 'string') {
				try {
					payload = JSON.parse(payload)
				} catch (parseError) {
					payload = { text: payload }
				}
			}

			if (Array.isArray(payload?.messages) || Array.isArray(payload?.history) || Array.isArray(payload?.items) || Array.isArray(payload?.results)) {
				setMessages(normalizeHistory(payload))
				return
			}

			const normalized = normalizeMessage(payload)
			if (!normalized) return

			setMessages(prev => {
				const existingIndex = normalized.clientMessageId
					? prev.findIndex(message => message.clientMessageId && message.clientMessageId === normalized.clientMessageId)
					: prev.findIndex(message => message.id === normalized.id)

				if (existingIndex >= 0) {
					const next = [...prev]
					next[existingIndex] = { ...next[existingIndex], ...normalized, status: normalized.status || next[existingIndex].status }
					return next
				}

				return [...prev, normalized]
			})

			if (normalized.role === 'support' && !isOpen) {
				setUnreadCount(count => count + 1)
			}
		}

		socket.onerror = () => {
			setError(t('support.chat.connection_error') || 'Unable to connect to support chat')
		}

		socket.onclose = () => {
			setStatus(isOpen ? CLOSED_STATE : SIGNED_OUT_STATE)
			socketRef.current = null
		}

		return () => {
			if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
				socket.close()
			}
		}
	}, [isOpen, token, t])

	useEffect(() => {
		if (isOpen) {
			messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
		}
	}, [messages, isOpen])

	useEffect(() => {
		if (isOpen) {
			inputRef.current?.focus()
		}
	}, [isOpen])

	const openSupportChat = () => {
		if (!isAuthenticated) {
			navigate('/login', { state: { from: '/support' } })
			return
		}

		setIsOpen(true)
		setUnreadCount(0)
	}

	const closeSupportChat = () => {
		setIsOpen(false)
		setUnreadCount(0)
	}

	const handleSendMessage = () => {
		const text = draft.trim()
		if (!text || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
			return
		}

		const clientMessageId = makeMessageId('client')
		const pendingMessage = {
			id: clientMessageId,
			clientMessageId,
			role: 'user',
			text,
			createdAt: new Date().toISOString(),
			status: 'sending'
		}

		setMessages(prev => [...prev, pendingMessage])
		setDraft('')
		setError('')

		try {
			socketRef.current.send(JSON.stringify({
				type: 'message',
				text,
				client_message_id: clientMessageId
			}))
			setMessages(prev => prev.map(message => (
				message.id === clientMessageId ? { ...message, status: 'sent' } : message
			)))
		} catch (sendError) {
			setError(sendError?.message || t('support.chat.send_error') || 'Unable to send message')
			setDraft(text)
			setMessages(prev => prev.filter(message => message.id !== clientMessageId))
		}
	}

	if (!isAuthenticated) {
		return null
	}

	return (
		<>
			<button
				type="button"
				onClick={openSupportChat}
				className="fixed bottom-6 right-6 z-[140] rounded-full bg-indigo-600 px-5 py-3 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
				aria-label={t('support.chat.button') || 'Support chat'}
			>
				<span className="flex items-center gap-2">
					<span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-lg">?</span>
					<span className="font-medium">{t('support.chat.button') || 'Support chat'}</span>
					{unreadCount > 0 && (
						<span className="ml-1 inline-flex min-w-6 items-center justify-center rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-indigo-700">
							{unreadCount}
						</span>
					)}
				</span>
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-[150] flex items-end justify-end bg-black/25 p-4 sm:items-end sm:justify-end">
					<div className="flex h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-hard sm:h-[620px]">
						<header className="flex items-start justify-between gap-3 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-4 text-white">
							<div>
								<p className="site-title text-lg font-semibold">{t('support.chat.title') || 'Support chat'}</p>
								<p className="mt-1 text-sm text-white/80">{t('support.chat.subtitle') || 'Private help for your account and orders'}</p>
							</div>
							<div className="flex items-center gap-2">
								<span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">{headerLabel}</span>
								<button
									type="button"
									onClick={closeSupportChat}
									className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white hover:bg-white/20"
								>
									{t('support.chat.close') || 'Close'}
								</button>
							</div>
						</header>

						<div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 text-sm text-gray-600">
							<span>{t('support.chat.account_scoped') || 'Messages are linked to this account only'}</span>
										<span className="font-medium text-indigo-600">{status === OPEN_STATE ? (t('support.chat.live') || 'Live') : (t('support.chat.queued') || 'Queued')}</span>
						</div>

						<div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(21,97,109,0.03),transparent_30%)] px-4 py-4">
							{messages.length === 0 ? (
								<div className="rounded-2xl border border-dashed border-gray-300 bg-white/80 p-4 text-sm text-gray-600">
									<p className="font-medium text-gray-800">{t('support.chat.empty_title') || 'Start a support conversation'}</p>
									<p className="mt-1">{t('support.chat.empty_text') || 'Ask a question about your order, account, or delivery and support will reply here.'}</p>
								</div>
							) : (
								<div className="space-y-3">
									{messages.map(message => {
										const isUser = message.role === 'user'
										return (
											<div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
												<div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isUser ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
													<p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
													<div className={`mt-2 flex items-center justify-between gap-2 text-[11px] ${isUser ? 'text-white/70' : 'text-gray-500'}`}>
														<span>{isUser ? (message.status === 'sending' ? t('support.chat.sending') || 'Sending...' : t('support.chat.you') || 'You') : (t('support.chat.agent') || 'Support')}</span>
														<span>{formatMessageTime(message.createdAt)}</span>
													</div>
												</div>
											</div>
										)
									})}
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>

						<div className="border-t border-gray-200 bg-white px-4 py-3">
							{error && <p className="mb-2 text-sm text-red-600">{error}</p>}
							<div className="flex items-end gap-3">
								<textarea
									ref={inputRef}
									value={draft}
									onChange={(event) => setDraft(event.target.value)}
									onKeyDown={(event) => {
										if (event.key === 'Enter' && !event.shiftKey) {
											event.preventDefault()
											handleSendMessage()
										}
									}}
									rows={2}
									placeholder={t('support.chat.placeholder') || 'Write your message...'}
									className="min-h-[52px] flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm"
								/>
								<button
									type="button"
									onClick={handleSendMessage}
									disabled={!draft.trim() || status !== OPEN_STATE}
									className="inline-flex h-[52px] items-center justify-center rounded-2xl bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{t('support.chat.send') || 'Send'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
