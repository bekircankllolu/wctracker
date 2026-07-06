import { useEffect, useRef, useState } from "react";
import { CHAT_MAX, type Message } from "../lib/useMessages";

type Props = {
  messages: Message[];
  identity: string | null;
  onSend: (body: string) => void;
  onPickIdentity: () => void;
};

export default function Chat({ messages, identity, onSend, onPickIdentity }: Props) {
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  // Yeni mesajda en alta kaydır.
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
    <div className="panel chat-panel">
      <div className="panel-title">
        <span>💬 Sohbet</span>
        <span className="panel-sub">tuvalettekiyle konuş</span>
      </div>

      <div className="chat-list" ref={listRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">İlk mesajı sen yaz ✍️</div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`chat-msg ${m.sender === identity ? "mine" : ""}`}
            >
              <span className="chat-sender">{m.sender}</span>
              <span className="chat-body">{m.body}</span>
            </div>
          ))
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
          <button className="chat-send" disabled={!text.trim()} onClick={submit}>
            Gönder
          </button>
        </div>
      ) : (
        <button className="chat-pick" onClick={onPickIdentity}>
          Sohbet için “Ben kimim?” seç
        </button>
      )}
    </div>
  );
}
