import { randomId } from './utils.js';
export const initBooks = (data, onChange) => {
    const titleInput = document.getElementById('bookTitle');
    const authorInput = document.getElementById('bookAuthor');
    const categoryInput = document.getElementById('bookCategory');
    const pagesInput = document.getElementById('bookPages');
    const readPagesInput = document.getElementById('bookReadPages');
    const statusSelect = document.getElementById('bookStatus');
    const addButton = document.getElementById('addBookButton');
    const resetButton = document.getElementById('resetBookForm');
    const bookList = document.getElementById('bookList');
    const bookCount = document.getElementById('bookCount');
    const bookCompletedCount = document.getElementById('bookCompletedCount');
    const bookProgressBar = document.getElementById('bookProgressBar');
    const render = () => {
        bookList.innerHTML = '';
        data.books.forEach((book) => {
            const item = document.createElement('li');
            const progress = book.pages ? Math.round((book.readPages / book.pages) * 100) : 0;
            item.innerHTML = `<div><strong>${book.title}</strong><span>${book.author || 'Autor não informado'}</span><div class="task-meta"><span>${book.category || 'Sem categoria'}</span><span>${book.status}</span><span>${progress}% lido</span></div><div class="progress-bar"><span style="width:${progress}%"></span></div></div><div class="task-actions"><button class="btn-secondary" type="button">Editar</button><button class="btn-secondary" type="button">Excluir</button></div>`;
            item.querySelectorAll('button')[0].addEventListener('click', () => {
                titleInput.value = book.title;
                authorInput.value = book.author;
                categoryInput.value = book.category;
                pagesInput.value = book.pages;
                readPagesInput.value = book.readPages;
                statusSelect.value = book.status;
                const updated = { ...data };
                updated.books = updated.books.filter((item) => item.id !== book.id);
                onChange(updated);
            });
            item.querySelectorAll('button')[1].addEventListener('click', () => {
                const updated = { ...data };
                updated.books = updated.books.filter((item) => item.id !== book.id);
                onChange(updated);
            });
            bookList.appendChild(item);
        });
        bookCount.textContent = `${data.books.length}`;
        bookCompletedCount.textContent = `${data.books.filter((book) => book.status === 'Concluído').length}`;
        const total = data.books.reduce((sum, book) => sum + (book.pages ? Math.min(book.readPages, book.pages) : 0), 0);
        const max = data.books.reduce((sum, book) => sum + (book.pages || 0), 0) || 1;
        bookProgressBar.style.width = `${Math.round((total / max) * 100)}%`;
    };
    const formReset = () => {
        titleInput.value = '';
        authorInput.value = '';
        categoryInput.value = '';
        pagesInput.value = '';
        readPagesInput.value = '';
        statusSelect.value = 'Lendo';
    };
    addButton.addEventListener('click', () => {
        const title = titleInput.value.trim();
        if (!title) return;
        const book = {
            id: randomId(),
            title,
            author: authorInput.value.trim(),
            category: categoryInput.value.trim(),
            pages: Number(pagesInput.value) || 0,
            readPages: Number(readPagesInput.value) || 0,
            status: statusSelect.value
        };
        const updated = { ...data };
        updated.books = [book, ...updated.books];
        onChange(updated);
        formReset();
    });
    resetButton.addEventListener('click', formReset);
    render();
    return { refresh: render };
};
