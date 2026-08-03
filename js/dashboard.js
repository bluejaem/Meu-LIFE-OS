import { createChartBars } from './utils.js';
export const refreshDashboard = (data) => {
    document.getElementById('todayHours').textContent = `${data.hours.today} h`;
    document.getElementById('weeklyHours').textContent = `${data.hours.week} h`;
    document.getElementById('monthlyHours').textContent = `${data.hours.month} h`;
    document.getElementById('streakDays').textContent = `${data.hours.streak} dias`;
    document.getElementById('dailyGoalLabel').textContent = `${data.hours.dailyGoal}h`;
    document.getElementById('weeklyGoalLabel').textContent = `${data.hours.weeklyGoal}h`;
    document.getElementById('monthlyGoalLabel').textContent = `${data.hours.monthlyGoal}h`;
    const recentEvents = document.getElementById('dashboardRecentEvents');
    const recentTasks = document.getElementById('dashboardRecentTasks');
    recentEvents.innerHTML = '';
    recentTasks.innerHTML = '';
    data.events.slice(-4).reverse().forEach((event) => {
        const item = document.createElement('li');
        item.innerHTML = `<strong>${event.title}</strong><span>${event.day} • ${event.time}</span>`;
        recentEvents.appendChild(item);
    });
    data.tasks.slice(-4).reverse().forEach((task) => {
        const item = document.createElement('li');
        item.innerHTML = `<strong>${task.title}</strong><span>${task.category} • ${task.priority}</span>`;
        recentTasks.appendChild(item);
    });
    document.getElementById('statOpenTasks').textContent = `${data.tasks.filter((task) => !task.done).length}`;
    document.getElementById('statEvents').textContent = `${data.events.length}`;
    document.getElementById('statProjects').textContent = `${data.kanban.length}`;
    const weeklyChart = document.getElementById('weeklyChart');
    const monthlyChart = document.getElementById('monthlyChart');
    if (weeklyChart) {
        const values = data.events.slice(-7).map((event) => ({ label: event.day.slice(0, 2), value: Number(event.duration) || 60 }));
        createChartBars(weeklyChart, values.length ? values : [{ label: 'SEG', value: 1 }, { label: 'TER', value: 1 }, { label: 'QUA', value: 1 }, { label: 'QUI', value: 1 }, { label: 'SEX', value: 1 }, { label: 'SAB', value: 1 }, { label: 'DOM', value: 1 }]);
    }
    if (monthlyChart) {
        createChartBars(monthlyChart, Array.from({ length: 7 }, (_, index) => ({ label: `S${index + 1}`, value: Math.floor(Math.random() * 5 + 3) })));
    }
};
