import { SecurityMiddleware } from '../security.js';
import config from '../config.js';

class WebSocketManager {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect() {
        try {
            this.socket = new WebSocket(config.endpoints.websocket);
            this.setupEventListeners();
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.handleReconnect();
        }
    }

    setupEventListeners() {
        this.socket.addEventListener('open', () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
        });

        this.socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        });

        this.socket.addEventListener('close', () => {
            console.log('WebSocket closed');
            this.handleReconnect();
        });

        this.socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });
    }

    handleMessage(data) {
        // 验证消息
        if (!SecurityMiddleware.validateMessage(data)) {
            console.error('Invalid message received');
            return;
        }

        // 处理不同类型的消息
        switch (data.type) {
            case 'update':
                this.handleUpdate(data);
                break;
            case 'notification':
                this.handleNotification(data);
                break;
            default:
                console.warn('Unknown message type:', data.type);
        }
    }

    handleUpdate(data) {
        // 处理更新消息
        const event = new CustomEvent('resource-update', { detail: data });
        window.dispatchEvent(event);
    }

    handleNotification(data) {
        // 处理通知消息
        const event = new CustomEvent('notification', { detail: data });
        window.dispatchEvent(event);
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.error('WebSocket is not connected');
        }
    }
}

export const wsManager = new WebSocketManager();
export default wsManager;
