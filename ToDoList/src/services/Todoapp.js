// src/main.js
import User from '../models/User.js';
import Task from '../models/Task.js';

class TodoApp {
  constructor() {
    this.users = [];
    this.tasks = []; // liste de Task {id, userId, text, done, createdAt}
    this.currentUser = null;
    this.init();
  }

  init() {
    this.loadFromLocalStorage();
    this.initializeSampleData();
    this.setupEventListeners();
    this.checkAuthentication();
  }

  // ==================== GESTION DES DONNÉES ====================

  loadFromLocalStorage() {
    const usersData = localStorage.getItem('users');
    const tasksData = localStorage.getItem('tasks');
    const currentUserData = localStorage.getItem('currentUser');

    if (usersData) {
      // Reconstruire les instances User (en supposant constructeur User(id, name, email, password))
      this.users = JSON.parse(usersData).map(u => new User(u.id, u.name, u.email, u.password));
    }

    if (tasksData) {
      // Reconstruire les instances Task (on suppose Task(id, userId, text, done, createdAt))
      this.tasks = JSON.parse(tasksData).map(t => new Task(t.id, t.userId, t.text, t.done, t.createdAt));
    }

    if (currentUserData) {
      const u = JSON.parse(currentUserData);
      this.currentUser = new User(u.id, u.name, u.email, u.password);
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('users', JSON.stringify(this.users));
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    if (this.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  initializeSampleData() {
    // si pas d'utilisateurs, ajouter un sample user (pratique pour démo)
    if (this.users.length === 0) {
      const demo = User.create?.('Demo User', 'demo@example.com', 'demo') || new User(`u-${Date.now()}`, 'Demo User', 'demo@example.com', 'demo');
      this.users.push(demo);
      // quelques tâches sample pour le demo user
      const t1 = Task.create?.(demo.id, 'Découvrir l\'application', false) || new Task(`t-${Date.now()}`, demo.id, 'Découvrir l\'application', false, new Date().toISOString());
      const t2 = Task.create?.(demo.id, 'Ajouter ma première tâche', false) || new Task(`t-${Date.now()+1}`, demo.id, 'Ajouter ma première tâche', false, new Date().toISOString());
      this.tasks.push(t1, t2);
      this.saveToLocalStorage();
    }
  }

  // ==================== AUTHENTIFICATION ====================

  checkAuthentication() {
    if (this.currentUser) {
      this.showDashboard();
    } else {
      this.showLoginPage();
    }
  }

  register(name, email, password) {
    const existing = this.users.find(u => u.email === email);
    if (existing) throw new Error('Un utilisateur avec cet email existe déjà');
    const newUser = User.create?.(name, email, password) || new User(`u-${Date.now()}`, name, email, password);
    this.users.push(newUser);
    this.saveToLocalStorage();
    return newUser;
  }

  login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Email ou mot de passe incorrect');
    this.currentUser = user;
    this.saveToLocalStorage();
    return user;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.showLoginPage();
  }

  // ==================== GESTION DES TÂCHES ====================

  createTask(text) {
    if (!this.currentUser) throw new Error('Utilisateur non authentifié');
    const newTask = Task.create?.(this.currentUser.id, text) || new Task(`t-${Date.now()}`, this.currentUser.id, text, false, new Date().toISOString());
    this.tasks.push(newTask);
    this.saveToLocalStorage();
    return newTask;
  }

  toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId && t.userId === this.currentUser.id);
    if (!task) return;
    task.done = !task.done;
    this.saveToLocalStorage();
    this.renderTasks();
  }

  deleteTask(taskId) {
    const idx = this.tasks.findIndex(t => t.id === taskId && t.userId === this.currentUser.id);
    if (idx !== -1) {
      this.tasks.splice(idx, 1);
      this.saveToLocalStorage();
      this.renderTasks();
    }
  }

  getUserTasks() {
    if (!this.currentUser) return [];
    // trier par createdAt asc
    return this.tasks
      .filter(t => t.userId === this.currentUser.id)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  // ==================== AFFICHAGE ====================

  showLoginPage() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('registerPage').classList.add('hidden');
    document.getElementById('dashboard').classList.add('hidden');
  }

  showRegisterPage() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('registerPage').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
  }

  showDashboard() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('registerPage').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');

    document.getElementById('userNameDisplay').textContent = `Bonjour, ${this.currentUser.name}`;
    this.renderTasks();
  }

  renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    const userTasks = this.getUserTasks();
    if (userTasks.length === 0) {
      taskList.innerHTML = '<li class="text-gray-500 text-center py-6 bg-white rounded-md shadow-sm">Aucune tâche pour le moment — ajoutez-en une !</li>';
      return;
    }

    userTasks.forEach(task => {
      const li = this.createTaskItem(task);
      taskList.appendChild(li);
    });
  }

  createTaskItem(task) {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between bg-white p-3 rounded-md shadow-sm';

    // gauche : checkbox + text
    const left = document.createElement('div');
    left.className = 'flex items-center space-x-3';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!task.done;
    checkbox.className = 'w-4 h-4';
    checkbox.addEventListener('change', () => this.toggleTask(task.id));

    const span = document.createElement('span');
    span.textContent = task.text;
    span.className = task.done ? 'line-through text-gray-400' : '';

    left.appendChild(checkbox);
    left.appendChild(span);

    // droite : actions
    const right = document.createElement('div');
    right.className = 'flex items-center space-x-2';

    const delBtn = document.createElement('button');
    delBtn.className = 'text-red-600 hover:underline text-sm';
    delBtn.textContent = 'Supprimer';
    delBtn.addEventListener('click', () => {
      if (confirm('Supprimer cette tâche ?')) {
        this.deleteTask(task.id);
      }
    });

    right.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(right);

    return li;
  }

  // ==================== ÉVÉNEMENTS ====================

  setupEventListeners() {
    // Connexion
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      try {
        this.login(email, password);
        this.showDashboard();
        e.target.reset();
      } catch (err) {
        alert(err.message);
      }
    });

    // Inscription
    document.getElementById('registerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('registerName').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      try {
        this.register(name, email, password);
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        this.showLoginPage();
        e.target.reset();
      } catch (err) {
        alert(err.message);
      }
    });

    // bascules connexion / inscription
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    if (showRegisterLink) {
      showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showRegisterPage();
      });
    }
    if (showLoginLink) {
      showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showLoginPage();
      });
    }

    // Déconnexion
    document.getElementById('logoutBtn').addEventListener('click', () => {
      this.logout();
    });

    // Ajout de tâche
    document.getElementById('taskForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const text = document.getElementById('taskInput').value.trim();
      if (!text) return;
      try {
        this.createTask(text);
        document.getElementById('taskInput').value = '';
        this.renderTasks();
      } catch (err) {
        alert(err.message);
      }
    });
  }
}



    // Simulation d’un système simple de comptes et tâches

    const loginPage = document.getElementById('loginPage');
    const registerPage = document.getElementById('registerPage');
    const dashboard = document.getElementById('dashboard');
    const userNameDisplay = document.getElementById('userNameDisplay');

    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');

    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let tasks = JSON.parse(localStorage.getItem('tasks')) || {};

    function saveData() {
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    function showDashboard() {
      loginPage.classList.add('hidden');
      registerPage.classList.add('hidden');
      dashboard.classList.remove('hidden');
      userNameDisplay.textContent = currentUser?.name || '';
      renderTasks();
    }

    function renderTasks() {
      taskList.innerHTML = '';
      const userTasks = tasks[currentUser.email] || [];
      userTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = "flex items-center justify-between bg-white p-3 rounded-md shadow-sm";
        li.innerHTML = `
          <span class="${task.done ? 'line-through text-gray-400' : ''}">${task.text}</span>
          <div class="space-x-2">
            <button class="text-green-600 hover:underline" onclick="toggleTask(${index})">✔</button>
            <button class="text-red-600 hover:underline" onclick="deleteTask(${index})">✖</button>
          </div>
        `;
        taskList.appendChild(li);
      });
    }

    function toggleTask(index) {
      tasks[currentUser.email][index].done = !tasks[currentUser.email][index].done;
      saveData();
      renderTasks();
    }

    function deleteTask(index) {
      tasks[currentUser.email].splice(index, 1);
      saveData();
      renderTasks();
    }

    // Ajout d’une tâche
    taskForm.addEventListener('submit', e => {
      e.preventDefault();
      const text = taskInput.value.trim();
      if (!text) return;
      if (!tasks[currentUser.email]) tasks[currentUser.email] = [];
      tasks[currentUser.email].push({ text, done: false });
      taskInput.value = '';
      saveData();
      renderTasks();
    });

    // Inscription
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      if (users.find(u => u.email === email)) {
        alert('Un compte existe déjà avec cet email.');
        return;
      }
      users.push({ name, email, password });
      saveData();
      alert('Inscription réussie ! Vous pouvez vous connecter.');
      registerPage.classList.add('hidden');
      loginPage.classList.remove('hidden');
    });

    // Connexion
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        alert('Email ou mot de passe incorrect.');
        return;
      }
      currentUser = user;
      saveData();
      showDashboard();
    });

    logoutBtn.addEventListener('click', () => {
      currentUser = null;
      saveData();
      dashboard.classList.add('hidden');
      loginPage.classList.remove('hidden');
    });

    showRegister.addEventListener('click', () => {
      loginPage.classList.add('hidden');
      registerPage.classList.remove('hidden');
    });

    showLogin.addEventListener('click', () => {
      registerPage.classList.add('hidden');
      loginPage.classList.remove('hidden');
    });

    // Auto-connexion si déjà logué
    if (currentUser) showDashboard();





// Créer l'instance et l'exposer pour debug si besoin
const app = new TodoApp();
window.app = app;
export default TodoApp;
