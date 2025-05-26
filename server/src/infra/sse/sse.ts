import { Request, Response } from 'express';
import { logger } from '../logger/pino-logger';
import { getClientIdFromRequest } from './sse.utils';

// Each id maps to a set of client responses
// id is a client-generated unique identifier (from a cookie), not a userId
const clients: Map<string, Set<Response>> = new Map();
// Map userId to a set of client ids
const userClients: Map<string, Set<string>> = new Map();

export function associateUserIdWithClientId(userId: string, clientId: string) {
  if (!userClients.has(userId)) userClients.set(userId, new Set());
  userClients.get(userId)!.add(clientId);
  logger.info(`Associated userId ${userId} with clientId ${clientId}`);
}

export function sseHandler(req: Request, res: Response) {
  // Prefer id from cookie, fallback to query param for backward compatibility
  const id = getClientIdFromRequest(req)
  const userId = req.user?.id
  if (!id) return res.status(400).end();

  logger.info(`SSE handler for ${id}${userId ? ` (userId: ${userId})` : ''}`);

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',          
    'Content-Encoding': 'none',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  if (!clients.has(id)) clients.set(id, new Set());
  clients.get(id)!.add(res);

  // If userId is provided, associate it with this client id
  if (userId) associateUserIdWithClientId(userId, id);

  // Send a ping event to test connection
  res.write(`event: ping\ndata: {\"message\":\"pong\"}\n\n`);

  req.on('close', () => {
    const set = clients.get(id);
    if (set) {
      set.delete(res);
      if (set.size === 0) clients.delete(id);
    }
    // Optionally: remove clientId from userClients
    if (userId && userClients.has(userId)) {
      const userSet = userClients.get(userId)!;
      userSet.delete(id);
      if (userSet.size === 0) userClients.delete(userId);
    }
  });
}

export function sendSseEventToClientId(clientId: string, event: string, data: any) {
  logger.info(`Sending SSE event to clientId ${clientId}: ${event} with data: ${JSON.stringify(data)}`);
  print(clients, `clients: ${clientId}`);
  const set = clients.get(clientId);
  if (!set) return;
  for (const res of set) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }
}

export function sendSseEventToUserId(userId: string, event: string, data: any) {
  logger.info(`Sending SSE event to userId ${userId}: ${event} with data: ${JSON.stringify(data)}`);
  print(userClients, `userClients: ${userId}`);
  const clientIds = userClients.get(userId);
  if (!clientIds) return;
  for (const clientId of clientIds) {
    sendSseEventToClientId(clientId, event, data);
  }
}

function print(map: Map<string, Set<any>>, message: string) {
  logger.info(message);
  for (const [key, value] of map.entries()) {
    logger.info(key, value);
  }
}
