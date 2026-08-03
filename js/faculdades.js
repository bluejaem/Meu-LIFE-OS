export const initFaculdades = (data, onChange) => {
    const container = document.getElementById('facultyCards');
    const render = () => {
        container.innerHTML = '';
        data.faculties.forEach((course) => {
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `<div class="card-header"><h3>${course.name}</h3><span>${course.disciplines.length} disciplinas</span></div><div class="stat-row"><span>Média</span><strong>${getAverage(course.disciplines)}</strong></div><div class="progress-bar"><span style="width:${getAverage(course.disciplines)}%"></span></div><div class="disciplines-list"></div><button class="btn-secondary" type="button">Adicionar disciplina</button>`;
            const list = card.querySelector('.disciplines-list');
            course.disciplines.forEach((item) => {
                const row = document.createElement('div');
                row.className = 'task-head';
                row.innerHTML = `<strong>${item.name}</strong><span>${item.grade.toFixed(1)} • ${item.attendance}%</span>`;
                list.appendChild(row);
            });
            card.querySelector('button').addEventListener('click', () => {
                const name = window.prompt('Nome da disciplina');
                const grade = Number(window.prompt('Nota média'));
                const attendance = Number(window.prompt('Frequência %'));
                if (!name) return;
                const updated = { ...data };
                const target = updated.faculties.find((item) => item.id === course.id);
                target.disciplines.push({ id: `disc_${Date.now()}`, name, grade: Number(grade) || 0, attendance: Number(attendance) || 0 });
                onChange(updated);
            });
            container.appendChild(card);
        });
    };
    const getAverage = (disciplines) => {
        if (!disciplines.length) return 0;
        return Math.round(disciplines.reduce((sum, item) => sum + item.grade, 0) / disciplines.length * 10);
    };
    render();
    return { refresh: render };
};
