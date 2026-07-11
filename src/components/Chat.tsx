import { useEffect, useRef, useState } from "react";
import { CHAT_MAX, type Message } from "../lib/useMessages";

type Props = {
  messages: Message[];
  identity: string | null;
  onSend: (body: string) => void;
  onPickIdentity: () => void;
};

const SENDER_COLORS = ["#c2410c", "#3f9e56", "#8b5cf6", "#3b82f6", "#0ea5e9"];
function senderTone(name: string): "tile" | "lavender" {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 2 === 0 ? "tile" : "lavender";
}
function senderColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return SENDER_COLORS[h % SENDER_COLORS.length];
}
function hhmm(iso: string) {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function Chat({ messages, identity, onSend, onPickIdentity }: Props) {
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function submit() {
    const body = text.trim();
    if (!body) return;
    onSend(body);
    setText("");
  }

  return (
    <div className="chat-screen">
      <div className="chat-list" ref={listRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">İlk mesajı sen yaz ✍️</div>
        ) : (
          messages.map((m) => {
            const mine = m.sender === identity;
            const tone = mine ? "peach" : senderTone(m.sender);
            return (
              <div
                className={`msg-row ${mine ? "mine" : ""} ${m.pending ? "pending" : ""} ${m.failed ? "failed" : ""}`}
                key={m.id}
              >
                <div className={`bubble ${tone}`}>
                  <span
                    className="msg-sender"
                    style={tone === "tile" ? { color: senderColor(m.sender) } : undefined}
                  >
                    {m.sender}
                  </span>
                  <span className="msg-body">{m.body}</span>
                </div>
                <span className="msg-time">
                  {m.failed ? "gönderilemedi ⚠️" : m.pending ? "gönderiliyor…" : hhmm(m.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {identity ? (
        <div className="chat-input-row">
          <input
            className="chat-input"
            value={text}
            maxLength={CHAT_MAX}
            placeholder={`${identity} olarak yaz…`}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <button className="chat-send" disabled={!text.trim()} onClick={submit} aria-label="Gönder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12l16-7-7 16-2.5-6.5L4 12Z" />
            </svg>
          </button>
        </div>
      ) : (
        <button className="chat-pick" onClick={onPickIdentity}>Sohbet için “Ben kimim?” seç</button>
      )}
    </div>
  );
}
