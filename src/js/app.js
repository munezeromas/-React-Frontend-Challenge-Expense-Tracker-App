// Expense Tracker App - Vanilla JavaScript Implementation
class ExpenseTracker {
    constructor() {
        this.currentUser = null;
        this.expenses = [];
        this.editingExpenseId = null;
        this.isLoginMode = true;
        
        this.init();
    }

    init() {
        this.loadUserFromStorage();
        this.bindEvents();
        this.setupDateDefault();
        
        if (this.currentUser) {
            this.showApp();
            this.loadExpenses();
            this.updateDashboard();
            this.renderTransactions();
        } else {
            this.showAuth();
        }
    }

    // Local Storage Methods
    loadUserFromStorage() {
        const user = localStorage.getItem('expense-tracker-user');
        if (user) {
            this.currentUser = JSON.parse(user);
        }
    }

    saveUserToStorage() {
        localStorage.setItem('expense-tracker-user', JSON.stringify(this.currentUser));
    }

    loadExpenses() {
        const expenses = localStorage.getItem('expense-tracker-expenses');
        if (expenses) {
            this.expenses = JSON.parse(expenses);
        }
    }

    saveExpenses() {
        localStorage.setItem('expense-tracker-expenses', JSON.stringify(this.expenses));
    }

    getUsersFromStorage() {
        const users = localStorage.getItem('expense-tracker-users');
        return users ? JSON.parse(users) : {};
    }

    saveUsersToStorage(users) {
        localStorage.setItem('expense-tracker-users', JSON.stringify(users));
    }

    // Authentication Methods
    bindEvents() {
        // Auth events
        const authForm = document.getElementById('auth-form');
        const toggleAuth = document.getElementById('toggle-auth');
        const logoutBtn = document.getElementById('logout-btn');
        
        authForm.addEventListener('submit', (e) => this.handleAuth(e));
        toggleAuth.addEventListener('click', () => this.toggleAuthMode());
        logoutBtn.addEventListener('click', () => this.logout());

        // Form events
        const expenseForm = document.getElementById('expense-form');
        const cancelBtn = document.getElementById('cancel-btn');
        
        expenseForm.addEventListener('submit', (e) => this.handleExpenseSubmit(e));
        cancelBtn.addEventListener('click', () => this.cancelEdit());

        // Filter events
        const filterToggle = document.getElementById('filter-toggle');
        const clearFilters = document.getElementById('clear-filters');
        const filterInputs = document.querySelectorAll('#filters-section input, #filters-section select');
        
        filterToggle.addEventListener('click', () => this.toggleFilters());
        clearFilters.addEventListener('click', () => this.clearFilters());
        
        filterInputs.forEach(input => {
            input.addEventListener('change', () => this.applyFilters());
        });
    }

    handleAuth(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const username = formData.get('username').trim();
        const password = formData.get('password').trim();
        const fullname = formData.get('fullname')?.trim();
        
        this.clearError('auth-error');
        
        if (!username || !password) {
            this.showError('auth-error', 'Please fill in all required fields');
            return;
        }

        const users = this.getUsersFromStorage();

        if (this.isLoginMode) {
            // Login
            const user = users[username];
            if (!user || user.password !== password) {
                this.showError('auth-error', 'Invalid username or password');
                return;
            }
            
            this.currentUser = { username, name: user.name };
            this.saveUserToStorage();
            this.showToast('Welcome back, ' + user.name + '!', 'success');
            this.showApp();
            this.loadExpenses();
            this.updateDashboard();
            this.renderTransactions();
            
        } else {
            // Register
            if (!fullname) {
                this.showError('auth-error', 'Please enter your full name');
                return;
            }
            
            if (users[username]) {
                this.showError('auth-error', 'Username already exists');
                return;
            }
            
            users[username] = { password, name: fullname };
            this.saveUsersToStorage(users);
            
            this.currentUser = { username, name: fullname };
            this.saveUserToStorage();
            this.showToast('Account created successfully! Welcome, ' + fullname + '!', 'success');
            this.showApp();
            this.updateDashboard();
            this.renderTransactions();
        }
    }

    toggleAuthMode() {
        this.isLoginMode = !this.isLoginMode;
        const subtitle = document.getElementById('auth-subtitle');
        const submitBtn = document.querySelector('#auth-form button[type="submit"]');
        const toggleBtn = document.getElementById('toggle-auth');
        const nameGroup = document.getElementById('name-group');
        
        if (this.isLoginMode) {
            subtitle.textContent = 'Sign in to your account';
            submitBtn.textContent = 'Sign In';
            toggleBtn.textContent = "Don't have an account? Sign up";
            nameGroup.style.display = 'none';
            document.getElementById('fullname').removeAttribute('required');
        } else {
            subtitle.textContent = 'Create a new account';
            submitBtn.textContent = 'Create Account';
            toggleBtn.textContent = 'Already have an account? Sign in';
            nameGroup.style.display = 'block';
            document.getElementById('fullname').setAttribute('required', '');
        }
        
        this.clearError('auth-error');
        document.getElementById('auth-form').reset();
    }

    logout() {
        this.currentUser = null;
        this.expenses = [];
        this.editingExpenseId = null;
        localStorage.removeItem('expense-tracker-user');
        this.showAuth();
        this.showToast('Logged out successfully', 'success');
    }

    // UI Methods
    showAuth() {
        document.getElementById('auth-section').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
    }

    showApp() {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        document.getElementById('user-name').textContent = `Welcome, ${this.currentUser.name}`;
    }

    setupDateDefault() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    // Expense Methods
    handleExpenseSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const expenseData = {
            description: formData.get('description').trim(),
            amount: parseFloat(formData.get('amount')),
            date: formData.get('date'),
            type: formData.get('type'),
            category: formData.get('category')
        };
        
        this.clearError('form-error');
        
        // Validation
        if (!expenseData.description) {
            this.showError('form-error', 'Description is required');
            return;
        }
        
        if (!expenseData.amount || expenseData.amount <= 0) {
            this.showError('form-error', 'Please enter a valid amount greater than 0');
            return;
        }
        
        if (!expenseData.date) {
            this.showError('form-error', 'Date is required');
            return;
        }
        
        if (!expenseData.type) {
            this.showError('form-error', 'Type is required');
            return;
        }
        
        if (!expenseData.category) {
            this.showError('form-error', 'Category is required');
            return;
        }

        if (this.editingExpenseId) {
            // Update existing expense
            const index = this.expenses.findIndex(exp => exp.id === this.editingExpenseId);
            if (index !== -1) {
                this.expenses[index] = { ...expenseData, id: this.editingExpenseId };
                this.showToast('Transaction updated successfully!', 'success');
            }
            this.cancelEdit();
        } else {
            // Add new expense
            const newExpense = {
                ...expenseData,
                id: this.generateId()
            };
            this.expenses.push(newExpense);
            this.showToast(`${expenseData.type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
            e.target.reset();
            this.setupDateDefault();
        }
        
        this.saveExpenses();
        this.updateDashboard();
        this.renderTransactions();
        this.updateCategoryFilter();
    }

    editExpense(id) {
        const expense = this.expenses.find(exp => exp.id === id);
        if (!expense) return;
        
        this.editingExpenseId = id;
        
        // Fill form with expense data
        document.getElementById('description').value = expense.description;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('date').value = expense.date;
        document.getElementById('type').value = expense.type;
        document.getElementById('category').value = expense.category;
        
        // Update form UI
        document.getElementById('form-title').textContent = 'Edit Transaction';
        document.getElementById('form-subtitle').textContent = 'Update your transaction details';
        document.getElementById('submit-btn').textContent = 'Update Transaction';
        document.getElementById('cancel-btn').style.display = 'block';
        
        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }

    deleteExpense(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            const expense = this.expenses.find(exp => exp.id === id);
            this.expenses = this.expenses.filter(exp => exp.id !== id);
            
            if (this.editingExpenseId === id) {
                this.cancelEdit();
            }
            
            this.saveExpenses();
            this.updateDashboard();
            this.renderTransactions();
            this.showToast(`${expense?.type === 'income' ? 'Income' : 'Expense'} deleted successfully!`, 'success');
        }
    }

    cancelEdit() {
        this.editingExpenseId = null;
        
        document.getElementById('form-title').textContent = 'Add New Transaction';
        document.getElementById('form-subtitle').textContent = 'Record your income or expense';
        document.getElementById('submit-btn').textContent = 'Add Transaction';
        document.getElementById('cancel-btn').style.display = 'none';
        
        document.getElementById('expense-form').reset();
        this.setupDateDefault();
        this.clearError('form-error');
    }

    // Dashboard Methods
    updateDashboard() {
        const totalIncome = this.expenses
            .filter(exp => exp.type === 'income')
            .reduce((sum, exp) => sum + exp.amount, 0);
            
        const totalExpenses = this.expenses
            .filter(exp => exp.type === 'expense')
            .reduce((sum, exp) => sum + exp.amount, 0);
            
        const balance = totalIncome - totalExpenses;
        const transactionCount = this.expenses.length;

        document.getElementById('total-balance').textContent = this.formatCurrency(balance);
        document.getElementById('total-income').textContent = this.formatCurrency(totalIncome);
        document.getElementById('total-expenses').textContent = this.formatCurrency(totalExpenses);
        document.getElementById('transaction-count').textContent = transactionCount;

        // Update balance color
        const balanceElement = document.getElementById('total-balance');
        balanceElement.className = 'amount-display ' + (balance >= 0 ? 'positive' : 'negative');
    }

    // Transaction Rendering
    renderTransactions() {
        const container = document.getElementById('transactions-list');
        const filteredExpenses = this.getFilteredExpenses();
        
        document.getElementById('transactions-count').textContent = 
            `${filteredExpenses.length} of ${this.expenses.length} transactions`;
        
        if (filteredExpenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>${this.expenses.length === 0 
                        ? 'No transactions yet. Add your first transaction above!' 
                        : 'No transactions match your filters.'}</p>
                </div>
            `;
            return;
        }

        // Sort by date (newest first)
        const sortedExpenses = filteredExpenses.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        container.innerHTML = sortedExpenses.map(expense => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-description">${expense.description}</div>
                    <div class="transaction-meta">
                        <span class="transaction-date">${this.formatDate(expense.date)}</span>
                        <span class="transaction-badge ${expense.type}">${expense.type}</span>
                        <span class="transaction-category">${expense.category}</span>
                    </div>
                </div>
                <div class="transaction-amount ${expense.type}">
                    ${expense.type === 'income' ? '+' : '-'}${this.formatCurrency(expense.amount)}
                </div>
                <div class="transaction-actions">
                    <button class="action-btn edit" onclick="app.editExpense('${expense.id}')">
                        ✏️ Edit
                    </button>
                    <button class="action-btn delete" onclick="app.deleteExpense('${expense.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Filter Methods
    toggleFilters() {
        const filtersSection = document.getElementById('filters-section');
        const isVisible = filtersSection.style.display !== 'none';
        filtersSection.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            this.updateCategoryFilter();
        }
    }

    updateCategoryFilter() {
        const categoryFilter = document.getElementById('filter-category');
        const categories = [...new Set(this.expenses.map(exp => exp.category))];
        
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(category => {
            categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
        });
    }

    applyFilters() {
        this.renderTransactions();
    }

    clearFilters() {
        document.getElementById('filter-start-date').value = '';
        document.getElementById('filter-end-date').value = '';
        document.getElementById('filter-type').value = '';
        document.getElementById('filter-category').value = '';
        this.renderTransactions();
    }

    getFilteredExpenses() {
        const startDate = document.getElementById('filter-start-date').value;
        const endDate = document.getElementById('filter-end-date').value;
        const type = document.getElementById('filter-type').value;
        const category = document.getElementById('filter-category').value;
        
        return this.expenses.filter(expense => {
            if (startDate && expense.date < startDate) return false;
            if (endDate && expense.date > endDate) return false;
            if (type && expense.type !== type) return false;
            if (category && expense.category !== category) return false;
            return true;
        });
    }

    // Utility Methods
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        errorElement.style.display = 'none';
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize the app
const app = new ExpenseTracker();