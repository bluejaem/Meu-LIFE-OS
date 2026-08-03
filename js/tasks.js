import { randomId } from './utils.js';
const priorities = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
const categoryLabels = { estudo: 'Estudo', trabalho: 'Trabalho', projeto: 'Projeto', pessoal: 'Pessoal' };
export const initTasks = (data, onChange) => {
    const form = document.getElementById('taskForm');
    const titleInput = document.getElementById('taskTitle');
    const categorySelect = document.getElementById('taskCategory');
    const prioritySelect = document.getElementById('taskPriority');
    const dueDateInput = document.getElementById('taskDueDate');
    const addSubtaskButton = document.getElementById('addSubtaskButton');
    const subtaskText = document.getElementById('subtaskText');
    const subtaskPreview = document.getElementById('subtaskPreview');
    const resetButton = document.getElementById('resetTaskForm');
    const searchInput = document.getElementById('taskSearch');
    const statusFilter = document.getElementById('taskStatusFilter');
    const categoryFilter = document.getElementById('taskCategoryFilter');
    const sortSelect = document.getElementById('taskSort');
    const taskList = document.getElementById('taskList');
    const summaryText = document.getElementById('taskSummaryText');
    const totalCountLabel = document.getElementById('taskCountTotal');
    const completedCountLabel = document.getElementById('taskCountCompleted');
    const progressBar = document.getElementById('taskProgressBar');
    let subtasks = [];
    const renderSubtasks = () => {
        subtaskPreview.innerHTML = '';
        subtasks.forEach((subtask, index) => {
            const item = document.createElement('div');
            item.className = 'subtask-chip';
            item.innerHTML = `<span>${subtask}</span><button type="button">✕</button>`;
            item.querySelector('button').addEventListener('click', () => {
                subtasks.splice(index, 1);
                renderSubtasks();
            });
            subtaskPreview.appendChild(item);
        });
    };
    const buildTask = (title, category, priority, dueDate) => ({
        id: randomId(),
        title,
        category,
        priority,
        dueDate,
        done: false,
        createdAt: Date.now(),
        subtasks
    });
    const resetForm = () => {
        form.reset();
        subtasks = [];
        renderSubtasks();
    };
    const sortTasks = (list) => {
        const sortValue = sortSelect.value;
        return list.slice().sort((a, b) => {
            if (sortValue === 'dueDate') {
                return (a.dueDate || '').localeCompare(b.dueDate || '');
            }
            if (sortValue === 'priority') {
                const order = { alta: 1, media: 2, baixa: 3 };
                return order[a.priority] - order[b.priority];
            }
            return b.createdAt - a.createdAt;
        });
    };
    const filterTasks = () => {
        const query = searchInput.value.toLowerCase();
        return sortTasks(data.tasks).filter((task) => {
            const statusMatch = statusFilter.value === 'all' || (statusFilter.value === 'active' && !task.done) || (statusFilter.value === 'completed' && task.done);
            const categoryMatch = categoryFilter.value === 'all' || task.category === categoryFilter.value;
            const searchMatch = task.title.toLowerCase().includes(query) || task.subtasks.some((sub) => sub.toLowerCase().includes(query));
            return statusMatch && categoryMatch && searchMatch;
        });
    };
    const renderTasks = () => {
        const visible = filterTasks();
        taskList.innerHTML = '';
        if (visible.length === 0) {
            summaryText.textContent = 'Nenhuma tarefa encontrada.';
        } else {
            summaryText.textContent = `${visible.length} tarefas mostradas.`;
        }
        visible.forEach((task) => {
            const item = document.createElement('li');
            item.innerHTML = `<div class="task-item"><div><div class="task-head"><h4>${task.title}</h4><span class="label-pill label-priority-${task.priority}">${priorities[task.priority]}</span></div><div class="task-meta"><span class="label-pill label-category-${task.category}">${categoryLabels[task.category]}</span><span>${task.dueDate ? task.dueDate : 'Sem prazo'}</span><span>${task.done ? 'Concluída' : 'Ativa'}</span></div>${task.subtasks.length ? `<div class="task-meta"><small>Subtarefas: ${task.subtasks.length}</small></div>` : ''}</div><div class="task-actions"><button class="btn-secondary" type="button">${task.done ? 'Reabrir' : 'Concluir'}</button><button class="btn-secondary" type="button">Editar</button><button class="btn-secondary" type="button">Excluir</button></div></div>`;
            const [toggleButton, editButton, removeButton] = item.querySelectorAll('button');
            toggleButton.addEventListener('click', () => {
                const updated = { ...data };
                const target = updated.tasks.find((item) => item.id === task.id);
                if (target) {
                    target.done = !target.done;
                    onChange(updated);
                }
            });
            editButton.addEventListener('click', () => {
                titleInput.value = task.title;
                categorySelect.value = task.category;
                prioritySelect.value = task.priority;
                dueDateInput.value = task.dueDate || '';
                subtasks = [...task.subtasks];
                renderSubtasks();
                const updated = { ...data };
                updated.tasks = updated.tasks.filter((item) => item.id !== task.id);
                onChange(updated);
            });
            removeButton.addEventListener('click', () => {
                const updated = { ...data };
                updated.tasks = updated.tasks.filter((item) => item.id !== task.id);
                onChange(updated);
            });
            taskList.appendChild(item);
        });
        const completedCount = data.tasks.filter((task) => task.done).length;
        totalCountLabel.textContent = `${data.tasks.length}`;
        completedCountLabel.textContent = `${completedCount}`;
        progressBar.style.width = data.tasks.length ? `${Math.floor((completedCount / data.tasks.length) * 100)}%` : '0%';
    };
    form.addEventListener('submit', (eventSubmit) => {
        eventSubmit.preventDefault();
        const title = titleInput.value.trim();
        if (!title) return;
        const newTask = buildTask(title, categorySelect.value, prioritySelect.value, dueDateInput.value);
        newTask.subtasks = [...subtasks];
        const updated = { ...data };
        updated.tasks = [newTask, ...updated.tasks];
        onChange(updated);
        resetForm();
    });
    addSubtaskButton.addEventListener('click', () => {
        const text = subtaskText.value.trim();
        if (!text) return;
        subtasks.push(text);
        subtaskText.value = '';
        renderSubtasks();
    });
    resetButton.addEventListener('click', resetForm);
    [searchInput, statusFilter, categoryFilter, sortSelect].forEach((input) => input.addEventListener('change', renderTasks));
    renderTasks();
    return { refresh: renderTasks };
};
