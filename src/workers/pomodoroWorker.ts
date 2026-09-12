let timerInterval: number | null = null;
let targetTime = 0;
let lastRemaining = -1;

self.onmessage = (e) => {
  const { type, payload } = e.data;

  if (type === 'START') {
    const { secondsLeft } = payload;
    targetTime = Date.now() + secondsLeft * 1000;
    
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    timerInterval = self.setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((targetTime - now) / 1000));
      
      if (remaining !== lastRemaining) {
        lastRemaining = remaining;
        self.postMessage({ type: 'TICK', payload: { secondsLeft: remaining } });
        
        if (remaining === 0) {
          if (timerInterval) clearInterval(timerInterval);
          self.postMessage({ type: 'FINISHED' });
        }
      }
    }, 200) as unknown as number; // 200ms para garantir que o pulo de segundo seja exato
  } 
  
  else if (type === 'PAUSE' || type === 'STOP') {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
};
