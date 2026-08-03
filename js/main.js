import { loadStorage, saveStorage } from './storage.js';
import { initializeNavigation, bindSidebarToggle, setTheme, setAccent, showPage } from './ui.js';
import { refreshDashboard } from './dashboard.js';
import { initCalendar } from './calendar.js';
import { initTasks } from './tasks.js';
import { initFaculdades } from './faculdades.js';
import { initBooks } from './livros.js';
import { initGoals } from './metas.js';
import { initDiary } from './diario.js';
import { initPomodoro } from './pomodoro.js';

let data = loadStorage();
const components = {};
const syncData = (updated) => {
    data = saveStorage(updated);
    Object.values(components).forEach((component) => component?.refresh?.());
};
const init = () => {
    setTheme(data.settings.theme);
    setAccent(data.settings.accent);
    showPage('dashboardPage');
    initializeNavigation((pageId) => showPage(pageId));
    bindSidebarToggle();
    components.dashboard = { refresh: () => refreshDashboard(data) };
    components.calendar = initCalendar(data, syncData);
    components.tasks = initTasks(data, syncData);
    components.faculdades = initFaculdades(data, syncData);
    components.books = initBooks(data, syncData);
    components.goals = initGoals(data, syncData);
    components.diary = initDiary(data, syncData);
    components.pomodoro = initPomodoro(data, syncData);
    components.dashboard.refresh();
    const themeSelect = document.getElementById('settingsTheme');
    const accentInput = document.getElementById('settingsAccent');
    const exportButton = document.getElementById('exportDataButton');
    const importInput = document.getElementById('importDataInput');
    const resetButton = document.getElementById('resetDataButton');
    themeSelect.addEventListener('change', () => {
        data.settings.theme = themeSelect.value;
        setTheme(data.settings.theme);
        syncData(data);
    });
    accentInput.addEventListener('input', () => {
        data.settings.accent = accentInput.value;
        setAccent(data.settings.accent);
        syncData(data);
    });
    exportButton.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'planner-ti-life-os.json';
        link.click();
        URL.revokeObjectURL(url);
    });
    importInput.addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        try {
            const parsed = JSON.parse(text);
            data = saveStorage({ ...data, ...parsed });
            window.location.reload();
        } catch (error) {
            alert('Arquivo JSON inválido.');
        }
    });
    resetButton.addEventListener('click', () => {
        if (confirm('Deseja resetar todo o sistema?')) {
            localStorage.clear();
            window.location.reload();
        }
    });
    document.getElementById('themeToggle').addEventListener('click', () => {
        data.settings.theme = data.settings.theme === 'light' ? 'dark' : 'light';
        setTheme(data.settings.theme);
        syncData(data);
    });
};
window.addEventListener('DOMContentLoaded', init);
