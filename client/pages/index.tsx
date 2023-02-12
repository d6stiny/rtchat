import type { NextPage } from "next";
import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import styles from "../styles/home.module.scss";

interface Message {
  user: string;
  text: string;
  time: number;
}

const Home: NextPage = () => {
  const [user, setUser] = useState<string>(
    `anon${(Math.random() + 1).toString(36).substring(7)}`
  );
  const [connected, setConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    setMessages((obj) => [
      ...obj,
      {
        user: "ADMIN",
        text: 'You can use the command "/name" to change your name.',
        time: Date.now(),
      },
    ]);
  }, []);

  const _handleChange = (event: ChangeEvent<{ value: string }>) => {
    setInput(event?.currentTarget?.value);
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080?name=" + user);

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onmessage = (event) => {
      setMessages((obj) => [...obj, JSON.parse(event.data)]);
      console.log(messages);
    };
  }, []);

  const _sendMessage = async () => {
    try {
      if (!input) return toast.error("message empty");
      if (input.startsWith("/")) {
        switch (input.split(" ")[0].replace("/", "").toLocaleLowerCase()) {
          case "name":
            if (input.split("/name ")[1].toString().length > 30)
              return toast.error("name too long");
            setUser(input.split("/name ")[1].toString());
            break;
          default:
            setInput("");
            break;
        }
        setInput("");
      } else {
        // TODO: Send message
        setInput("");
      }
    } catch (error) {
      console.error(error);
      toast.error("error sending message");
    }
  };

  const _handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === "Enter") {
      _sendMessage();
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.header}>
          <div>Messages</div>
          <div data-src={connected ? "true" : "false"}>
            {connected ? (
              <i className="ri-check-double-fill"></i>
            ) : (
              <i className="ri-loader-5-line"></i>
            )}
          </div>
        </div>
        <div className={styles.chat_container}>
          {messages
            .sort((a, b) => b.time - a.time)
            .map((e) => (
              <div key={e.time}>
                <b style={{ color: "#ffffff" }}>{e.user}</b>{" "}
                <span>{new Date(e.time).toLocaleTimeString()}</span> : {e.text}
              </div>
            ))}
        </div>
        <div className={styles.input_container}>
          <div>
            <input
              type={"text"}
              value={input}
              onChange={(e) => _handleChange(e)}
              onKeyDown={(e) => _handleKeyDown(e)}
              placeholder={"Message"}
              disabled={!connected}
            />
          </div>
          <button onClick={() => _sendMessage()} disabled={!connected}>
            Send <i className="ri-send-plane-2-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
