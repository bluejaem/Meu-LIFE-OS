export const initFaculdades = (data, onChange) => {
    const container = document.getElementById('facultyCards');

    // toolbar
    const renderToolbar = () => {
        const existing = document.getElementById('facultyToolbar');
        if (existing) existing.remove();
        const toolbar = document.createElement('div');
        toolbar.id = 'facultyToolbar';
        toolbar.style.display = 'flex';
        toolbar.style.gap = '8px';
        toolbar.style.marginBottom = '12px';

        const addBtn = document.createElement('button');
        addBtn.className = 'btn-primary';
        addBtn.textContent = 'Adicionar faculdade';
        addBtn.addEventListener('click', () => {
            const name = window.prompt('Nome da faculdade/curso');
            if (!name) return;
            const updated = { ...data };
            updated.faculties = [...(updated.faculties || []), { id: `fac_${Date.now()}`, name, disciplines: [] }];
            onChange(updated);
        });

        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn-secondary';
        clearBtn.textContent = 'Zerar faculdades';
        clearBtn.addEventListener('click', () => {
            if (!confirm('Deseja remover todas as faculdades?')) return;
            const updated = { ...data };
            updated.faculties = [];
            onChange(updated);
        });

        toolbar.appendChild(addBtn);
        toolbar.appendChild(clearBtn);
        container.parentElement.insertBefore(toolbar, container);
    };

    const getAverage = (disciplines) => {
        if (!disciplines || !disciplines.length) return 0;
        return Math.round((disciplines.reduce((sum, item) => sum + (item.grade || 0), 0) / disciplines.length) * 10) / 10;
    };

    const render = () => {
        renderToolbar();
        container.innerHTML = '';
        (data.faculties || []).forEach((course) => {
            const card = document.createElement('article');
            card.className = 'card';
            const avg = getAverage(course.disciplines);
            card.innerHTML = `<div class="card-header"><h3>${course.name}</h3><span>${(course.disciplines || []).length} disciplinas</span></div><div class="stat-row"><span>Média</span><strong>${avg}</strong></div><div class="progress-bar"><span style="width:${avg}%"></span></div><div class="disciplines-list"></div><div class="card-actions"></div>`;

            const list = card.querySelector('.disciplines-list');
                (course.disciplines || []).forEach((item) => {
                    const row = document.createElement('div');
                    row.className = 'task-head';
                    row.style.display = 'flex';
                    row.style.justifyContent = 'space-between';
                    row.style.alignItems = 'center';
                    row.innerHTML = `<div><strong>${item.name}</strong><div class="muted small">${(item.grade||0).toFixed(1)} • ${item.attendance || 0}%</div></div>`;
                    const controls = document.createElement('div');
                    controls.style.display = 'flex';
                    controls.style.gap = '8px';

                    const editBtn = document.createElement('button');
                    editBtn.className = 'btn-secondary';
                    editBtn.textContent = 'Editar';
                    editBtn.addEventListener('click', () => {
                        const name = window.prompt('Nome da disciplina', item.name);
                        if (name === null) return;
                        const grade = Number(window.prompt('Nota média', item.grade)) || 0;
                        const attendance = Number(window.prompt('Frequência %', item.attendance)) || 0;
                        const updated = { ...data };
                        const target = updated.faculties.find((f) => f.id === course.id);
                        const disc = target.disciplines.find((d) => d.id === item.id);
                        disc.name = name;
                        disc.grade = Number(grade) || 0;
                        disc.attendance = Number(attendance) || 0;
                        onChange(updated);
                    });

                    const delDiscBtn = document.createElement('button');
                    delDiscBtn.className = 'btn-danger';
                    delDiscBtn.textContent = 'Remover';
                    delDiscBtn.addEventListener('click', () => {
                        if (!confirm(`Remover a disciplina "${item.name}"?`)) return;
                        const updated = { ...data };
                        const target = updated.faculties.find((f) => f.id === course.id);
                        target.disciplines = (target.disciplines || []).filter((d) => d.id !== item.id);
                        onChange(updated);
                    });

                    controls.appendChild(editBtn);
                    controls.appendChild(delDiscBtn);
                    row.appendChild(controls);
                    list.appendChild(row);
                });

            const actions = card.querySelector('.card-actions');
            const addDiscBtn = document.createElement('button');
            addDiscBtn.className = 'btn-secondary';
            addDiscBtn.type = 'button';
            addDiscBtn.textContent = 'Adicionar disciplina';
            addDiscBtn.addEventListener('click', () => {
                const name = window.prompt('Nome da disciplina');
                if (!name) return;
                const grade = Number(window.prompt('Nota média')) || 0;
                const attendance = Number(window.prompt('Frequência %')) || 0;
                const updated = { ...data };
                const target = updated.faculties.find((item) => item.id === course.id);
                target.disciplines = [...(target.disciplines || []), { id: `disc_${Date.now()}`, name, grade: Number(grade) || 0, attendance: Number(attendance) || 0 }];
                onChange(updated);
            });

            const delBtn = document.createElement('button');
            delBtn.className = 'btn-danger';
            delBtn.type = 'button';
            delBtn.textContent = 'Remover faculdade';
            delBtn.addEventListener('click', () => {
                if (!confirm(`Remover a faculdade "${course.name}"?`)) return;
                const updated = { ...data };
                updated.faculties = (updated.faculties || []).filter((f) => f.id !== course.id);
                onChange(updated);
            });

            actions.appendChild(addDiscBtn);
            actions.appendChild(delBtn);

            container.appendChild(card);
        });
    };

    render();
    return { refresh: render };
};
