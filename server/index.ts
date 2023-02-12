import type { Server } from "bun";

const server = Bun.serve({
  port: 8080,
  websocket: {
    open(ws: any) {
      ws.subscribe("chat");
      console.log(`${ws.data.name} connected`);
    },
    message(ws: any, message: string) {
      try {
        ws.publishText(
          "chat",
          JSON.stringify({
            user: ws.data.name,
            text: message,
            time: Date.now(),
          })
        );
      } catch (error) {
        throw new Error("Failed to send message: ", error);
      }
    },
    close(ws: any) {
      console.log(`${ws.data.name} disconnected`);
    },
    perMessageDeflate: false,
  },
  fetch(request: Request, server: Server) {
    if (
      server.upgrade(request, {
        data: {
          name: new URL(request.url).searchParams.get("name"),
        },
      })
    )
      return;

    return new Response("Error");
  },
});

console.log(`🚀 Server ready at: ws://${server.hostname}:${server.port}`);
