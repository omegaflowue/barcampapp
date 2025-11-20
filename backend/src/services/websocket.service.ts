import { WebSocketServer, WebSocket } from 'ws';
import { WebSocketMessage, WebSocketMessageType } from '../types';

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Set<WebSocket>;

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.clients = new Set();
  }

  handleConnection(ws: WebSocket) {
    this.clients.add(ws);

    ws.on('close', () => {
      this.clients.delete(ws);
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.clients.delete(ws);
    });

    // Send welcome message
    this.sendToClient(ws, {
      type: 'session:new',
      data: { message: 'Connected to Barcamp Manager' },
      timestamp: new Date()
    });
  }

  broadcast(type: WebSocketMessageType, data: any) {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: new Date()
    };

    const messageStr = JSON.stringify(message);

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  sendToClient(client: WebSocket, message: WebSocketMessage) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }
}
