export const initPomodoro = (data, onChange) => {
    const timerDisplay = document.getElementById('pomodoroTimer');
    const statusText = document.getElementById('pomodoroStatus');
    const progressBar = document.getElementById('pomodoroProgress');
    const sessionsLabel = document.getElementById('pomodoroSessions');
    const startButton = document.getElementById('startPomodoro');
    const pauseButton = document.getElementById('pausePomodoro');
    const resetButton = document.getElementById('resetPomodoro');
    const presetButtons = Array.from(document.querySelectorAll('[data-time]'));
    const customButton = document.getElementById('customTimerButton');
    let intervalId = null;
    const updateDisplay = () => {
        const minutes = Math.floor(data.pomodoro.remainingSeconds / 60);
        const seconds = String(data.pomodoro.remainingSeconds % 60).padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;
        statusText.textContent = data.pomodoro.running ? 'Em execução' : 'Pronto para iniciar';
        progressBar.style.width = `${Math.round(((data.pomodoro.minutes * 60 - data.pomodoro.remainingSeconds) / (data.pomodoro.minutes * 60)) * 100)}%`;
        sessionsLabel.textContent = `${data.pomodoro.activeSessions}`;
    };
    const tick = () => {
        if (!data.pomodoro.running) return;
        const updated = { ...data };
        updated.pomodoro.remainingSeconds = Math.max(0, updated.pomodoro.remainingSeconds - 1);
        if (updated.pomodoro.remainingSeconds <= 0) {
            updated.pomodoro.running = false;
            updated.pomodoro.activeSessions += 1;
            playSound();
            clearInterval(intervalId);
            intervalId = null;
        }
        onChange(updated);
    };
    const playSound = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
            audioCtx.close();
        }, 300);
    };
    const startTimer = () => {
        if (data.pomodoro.running) return;
        const updated = { ...data };
        updated.pomodoro.running = true;
        if (updated.pomodoro.remainingSeconds <= 0) {
            updated.pomodoro.remainingSeconds = updated.pomodoro.minutes * 60;
        }
        onChange(updated);
        intervalId = setInterval(() => tick(), 1000);
    };
    const pauseTimer = () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        const updated = { ...data };
        updated.pomodoro.running = false;
        onChange(updated);
    };
    const resetTimer = () => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        const updated = { ...data };
        updated.pomodoro.running = false;
        updated.pomodoro.remainingSeconds = updated.pomodoro.minutes * 60;
        onChange(updated);
    };
    presetButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const minutes = Number(button.dataset.time);
            const updated = { ...data };
            updated.pomodoro.minutes = minutes;
            updated.pomodoro.remainingSeconds = minutes * 60;
            updated.pomodoro.running = false;
            onChange(updated);
        });
    });
    customButton.addEventListener('click', () => {
        const input = window.prompt('Defina minutos personalizados', '20');
        const minutes = Number(input);
        if (!minutes || minutes <= 0) return;
        const updated = { ...data };
        updated.pomodoro.minutes = minutes;
        updated.pomodoro.remainingSeconds = minutes * 60;
        updated.pomodoro.running = false;
        onChange(updated);
    });
    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);
    updateDisplay();
    return { refresh: updateDisplay };
};
