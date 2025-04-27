import { createClient } from "redis";
import { WebSocketServer } from "ws";

const REDIS_URL = "redis://localhost:6379";
const WS_PORT  = 8080;

// Redis subscriber client
const subscriber = createClient({ url: REDIS_URL });

async function startWebSocketServer() {
  // 1) Start WS server
  const wss = new WebSocketServer({ port: WS_PORT });
  console.log(`WebSocket server listening on ws://0.0.0.0:${WS_PORT}`);

  const clients = new Set<WebSocket>();

  wss.on("connection", (ws:any) => {
    console.log("Client connected");
    clients.add(ws);

    ws.on("close", () => {
      console.log("Client disconnected");
      clients.delete(ws);
    });
  });

  // 2) Connect Redis and subscribe
  await subscriber.connect();
  console.log("Subscribed to Redis at", REDIS_URL);
  await subscriber.subscribe("problem_done", (message) => {
    console.log("Pub/Sub ►", message);
    // Broadcast to all WS clients
    for (const ws of clients) {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
      }
    }
  });
}

startWebSocketServer().catch(console.error);
