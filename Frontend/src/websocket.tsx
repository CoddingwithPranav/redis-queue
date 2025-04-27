import React, { useState, useEffect } from 'react';

type Message = {
  problemId: number;
  status: string;
};

export const SubmissionUpdates: React.FC = ():any => {
  const [updates, setUpdates] = useState<Message[]>([]);
  const wsUrl = "ws://localhost:8080"
  useEffect(() => {
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const msg: Message = JSON.parse(event.data);
        // prepend the new update
        setUpdates(prev => [msg, ...prev]);
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error', err);
      ws.close();
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // you could reconnect here if desired
    };

    return () => {
      ws.close();
    };
  }, [wsUrl]);

  return (
    <div>
      <h3>Submission Status Updates</h3>
      {updates.length === 0 && <p>No updates yet.</p>}
      <ul>
        {updates.map((u, i) => (
          <li key={i}>
            Problem #{u.problemId}: <strong>{u.status}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};
