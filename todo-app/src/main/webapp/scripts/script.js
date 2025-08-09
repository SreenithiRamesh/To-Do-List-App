document.addEventListener('DOMContentLoaded', () => {

    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const loadingSpinner = document.getElementById('loading-spinner');
    const emptyState = document.getElementById('empty-state');

    const API_URL = '/todo-app/api/todos';

    const showLoading = (isLoading) => {
        loadingSpinner.style.display = isLoading ? 'block' : 'none';
        todoList.style.display = isLoading ? 'none' : 'block';
    };

    const showEmptyState = (isEmpty) => {
        emptyState.style.display = isEmpty ? 'flex' : 'none';
        todoList.style.display = isEmpty ? 'none' : 'block';
    };


    const fetchTodos = async () => {
        showLoading(true);
        showEmptyState(false);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            const todos = await response.json();

            todoList.innerHTML = '';
            if (todos.length === 0) {
                showEmptyState(true);
            } else {
                todos.forEach(renderTodo);
            }
        } catch (error) {
            console.error('Failed to fetch todos:', error);
      
        } finally {
            showLoading(false);
        }
    };

    const addTodo = async (title) => {
        const newTodo = { title, completed: false };
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTodo),
            });
            await fetchTodos(); 
        } catch (error) {
            console.error('Failed to add todo:', error);
        }
    };

    const updateTodo = async (id, completed, title) => {
        const todoToUpdate = { id, completed, title };
        try {
            await fetch(API_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(todoToUpdate),
            });
        } catch (error) {
            console.error('Failed to update todo:', error);
        }
    };

    const deleteTodo = async (id, element) => {
        element.classList.add('deleting');
       
        setTimeout(async () => {
            try {
                await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
                element.remove();
                // Check if the list is now empty
                if (todoList.children.length === 0) {
                    showEmptyState(true);
                }
            } catch (error) {
                console.error('Failed to delete todo:', error);
                element.classList.remove('deleting');
            }
        }, 400);
    };

    const renderTodo = (todo) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        li.innerHTML = `
            <div class="checkbox" role="button" aria-pressed="${todo.completed}">
                <span class="material-symbols-outlined">done</span>
            </div>
            <span class="task-text">${todo.title}</span>
            <div class="actions">
                <button class="edit-btn" aria-label="Edit Task"><span class="material-symbols-outlined">edit</span></button>
                <button class="delete-btn" aria-label="Delete Task"><span class="material-symbols-outlined">delete</span></button>
            </div>
        `;

    
        const checkbox = li.querySelector('.checkbox');
        const taskText = li.querySelector('.task-text');
        const deleteBtn = li.querySelector('.delete-btn');
        const editBtn = li.querySelector('.edit-btn');

    
        checkbox.addEventListener('click', () => {
            const isCompleted = !li.classList.contains('completed');
            li.classList.toggle('completed');
            updateTodo(todo.id, isCompleted, todo.title);
        });

      
        deleteBtn.addEventListener('click', () => {
            deleteTodo(todo.id, li);
        });

    
        editBtn.addEventListener('click', () => {
            const currentTitle = taskText.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'edit-input';
            input.value = currentTitle;

            taskText.replaceWith(input);
            input.focus();

            const saveChanges = async () => {
                const newTitle = input.value.trim();
                if (newTitle && newTitle !== currentTitle) {
                    await updateTodo(todo.id, todo.completed, newTitle);
                    todo.title = newTitle; 
                }
                input.replaceWith(taskText);
                taskText.textContent = todo.title; 
            };

            input.addEventListener('blur', saveChanges);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    input.blur();
                } else if (e.key === 'Escape') {
                    input.replaceWith(taskText);
                }
            });
        });

        todoList.appendChild(li);
    };


    todoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = todoInput.value.trim();
        if (title) {
            todoInput.value = '';
            await addTodo(title);
        }
    });

    fetchTodos();
});