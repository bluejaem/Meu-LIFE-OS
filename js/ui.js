import { saveStorage, loadStorage } from './storage.js';
export const setTheme = (theme) => {
    const app = document.querySelector('.app');
    if (!app) return;
    app.dataset.theme = theme;
    document.getElementById('settingsTheme').value = theme;
};
export const setAccent = (color) => {
    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--accent-soft', `${color}20`);
    document.getElementById('settingsAccent').value = color;
};
export const initializeNavigation = (onChangePage) => {
    const pageButtons = Array.from(document.querySelectorAll('.menu-link'));
    pageButtons.forEach((button) => {
        button.addEventListener('click', () => {
            pageButtons.forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            onChangePage(button.dataset.page);
        });
    });
};
export const bindSidebarToggle = () => {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    toggle?.addEventListener('click', () => sidebar?.classList.toggle('collapsed'));
};
export const showPage = (pageId) => {

    const pageTitle = document.getElementById('pageTitle');
    const topMessage = document.getElementById('topMessage');

    if(pageId === 'dashboardPage'){
        pageTitle.textContent = '';
        topMessage.textContent = '';
    }else{
        pageTitle.textContent =
            document.querySelector(`.menu-link[data-page="${pageId}"] span`)?.textContent || 'Planner';

        topMessage.textContent = '';
    }

    document.querySelectorAll('.page').forEach((page) => {
        page.classList.toggle('active', page.id === pageId);
    });
};
