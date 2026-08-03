import { randomId } from './utils.js';
export const initGoals = (data, onChange) => {
    const titleInput = document.getElementById('goalTitle');
    const categoryInput = document.getElementById('goalCategory');
    const progressInput = document.getElementById('goalProgress');
    const dueDateInput = document.getElementById('goalDueDate');
    const addButton = document.getElementById('addGoalButton');
    const resetButton = document.getElementById('resetGoalForm');
    const list = document.getElementById('goalList');
    const render = () => {
        list.innerHTML = '';
        data.goals.forEach((goal) => {
            const item = document.createElement('li');
            item.innerHTML = `<div><strong>${goal.title}</strong><span>${goal.category} • ${goal.dueDate ? goal.dueDate : 'Sem prazo'}</span><div class="progress-bar"><span style="width:${goal.progress}%"></span></div></div><div class="task-actions"><button class="btn-secondary" type="button">Editar</button><button class="btn-secondary" type="button">Excluir</button></div>`;
            item.querySelectorAll('button')[0].addEventListener('click', () => {
                titleInput.value = goal.title;
                categoryInput.value = goal.category;
                progressInput.value = goal.progress;
                dueDateInput.value = goal.dueDate;
                const updated = { ...data };
                updated.goals = updated.goals.filter((item) => item.id !== goal.id);
                onChange(updated);
            });
            item.querySelectorAll('button')[1].addEventListener('click', () => {
                const updated = { ...data };
                updated.goals = updated.goals.filter((item) => item.id !== goal.id);
                onChange(updated);
            });
            list.appendChild(item);
        });
    };
    addButton.addEventListener('click', () => {
        const title = titleInput.value.trim();
        if (!title) return;
        const goal = { id: randomId(), title, category: categoryInput.value, progress: Number(progressInput.value) || 0, dueDate: dueDateInput.value };
        const updated = { ...data };
        updated.goals = [goal, ...updated.goals];
        onChange(updated);
        resetForm();
    });
    const resetForm = () => {
        titleInput.value = '';
        categoryInput.value = 'Curto prazo';
        progressInput.value = '0';
        dueDateInput.value = '';
    };
    resetButton.addEventListener('click', resetForm);
    render();
    return { refresh: render };
};
