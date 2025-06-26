function ExpenseTracker() {
    this.transactions = this.loadTransactions();
    this.currentType = 'income';
    this.filterType = 'all';
    this.filterCategory = 'all';
    
    this.incomeCategories = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other Income'];
    this.expenseCategories = ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other Expense'];
    
    this.initializeEventListeners();
    this.setDefaultDate();
    this.updateCategoryOptions();
    this.renderTransactions();
    this.updateStats();
}

ExpenseTracker.prototype.loadTransactions = function() {
    var saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [
        {
            id: 1,
            amount: 3000.00,
            type: 'income',
            category: 'Salary',
            description: 'Monthly salary',
            date: '2024-06-01'
        },
        {
            id: 2,
            amount: 25.50,
            type: 'expense',
            category: 'Food',
            description: 'Lunch at cafe',
            date: '2024-06-15'
        },
        {
            id: 3,
            amount: 120.00,
            type: 'expense',
            category: 'Transportation',
            description: 'Gas for car',
            date: '2024-06-14'
        }
    ];
};

ExpenseTracker.prototype.saveTransactions = function() {
    localStorage.setItem('transactions', JSON.stringify(this.transactions));
};

ExpenseTracker.prototype.initializeEventListeners = function() {
    var self = this;
    
    // Tab buttons
    var tabButtons = document.querySelectorAll('.tab-button');
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].addEventListener('click', function() {
            self.switchTab(this.dataset.type);
        });
    }

    // Form submission
    document.getElementById('transactionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        self.addTransaction();
    });

    // Filter changes
    document.getElementById('filterType').addEventListener('change', function(e) {
        self.filterType = e.target.value;
        self.renderTransactions();
        self.updateStats();
    });

    document.getElementById('filterCategory').addEventListener('change', function(e) {
        self.filterCategory = e.target.value;
        self.renderTransactions();
        self.updateStats();
    });
};

ExpenseTracker.prototype.switchTab = function(type) {
    this.currentType = type;
    
    // Update tab buttons
    var tabButtons = document.querySelectorAll('.tab-button');
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
        if (tabButtons[i].dataset.type === type) {
            tabButtons[i].classList.add('active');
        }
    }
    
    // Update submit button text
    var submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = type === 'income' ? 'Add Income' : 'Add Expense';
    
    // Update category options
    this.updateCategoryOptions();
};

ExpenseTracker.prototype.updateCategoryOptions = function() {
    var categorySelect = document.getElementById('category');
    var categories = this.currentType === 'income' ? this.incomeCategories : this.expenseCategories;
    
    categorySelect.innerHTML = '';
    for (var i = 0; i < categories.length; i++) {
        var option = document.createElement('option');
        option.value = categories[i];
        option.textContent = categories[i];
        categorySelect.appendChild(option);
    }
    
    // Update filter category options
    var filterSelect = document.getElementById('filterCategory');
    var currentFilter = filterSelect.value;
    filterSelect.innerHTML = '<option value="all">All Categories</option>';
    
    var allCategories = this.incomeCategories.concat(this.expenseCategories);
    for (var j = 0; j < allCategories.length; j++) {
        var filterOption = document.createElement('option');
        filterOption.value = allCategories[j];
        filterOption.textContent = allCategories[j];
        filterSelect.appendChild(filterOption);
    }
    
    filterSelect.value = currentFilter;
};

ExpenseTracker.prototype.setDefaultDate = function() {
    var today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
};

ExpenseTracker.prototype.validateForm = function() {
    var isValid = true;
    var amount = document.getElementById('amount').value;
    var description = document.getElementById('description').value;
    var category = document.getElementById('category').value;
    var date = document.getElementById('date').value;

    // Hide all error messages first
    var errorMessages = document.querySelectorAll('.error-message');
    for (var i = 0; i < errorMessages.length; i++) {
        errorMessages[i].style.display = 'none';
    }

    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
        document.getElementById('amountError').style.display = 'block';
        isValid = false;
    }

    // Validate description
    if (!description.trim()) {
        document.getElementById('descriptionError').style.display = 'block';
        isValid = false;
    }

    // Validate category
    if (!category) {
        document.getElementById('categoryError').style.display = 'block';
        isValid = false;
    }

    // Validate date
    if (!date) {
        document.getElementById('dateError').style.display = 'block';
        isValid = false;
    }

    return isValid;
};

ExpenseTracker.prototype.addTransaction = function() {
    if (!this.validateForm()) {
        return;
    }

    var amount = parseFloat(document.getElementById('amount').value);
    var description = document.getElementById('description').value;
    var category = document.getElementById('category').value;
    var date = document.getElementById('date').value;

    var transaction = {
        id: Date.now(),
        amount: amount,
        type: this.currentType,
        category: category,
        description: description,
        date: date
    };

    this.transactions.unshift(transaction);
    this.saveTransactions();
    this.renderTransactions();
    this.updateStats();
    this.clearForm();
};

ExpenseTracker.prototype.deleteTransaction = function(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        this.transactions = this.transactions.filter(function(transaction) {
            return transaction.id !== id;
        });
        this.saveTransactions();
        this.renderTransactions();
        this.updateStats();
    }
};

ExpenseTracker.prototype.clearForm = function() {
    document.getElementById('transactionForm').reset();
    this.setDefaultDate();
    var errorMessages = document.querySelectorAll('.error-message');
    for (var i = 0; i < errorMessages.length; i++) {
        errorMessages[i].style.display = 'none';
    }
};

ExpenseTracker.prototype.getFilteredTransactions = function() {
    var filtered = this.transactions;
    
    // Filter by type
    if (this.filterType !== 'all') {
        filtered = filtered.filter(function(transaction) {
            return transaction.type === this.filterType;
        }.bind(this));
    }
    
    // Filter by category
    if (this.filterCategory !== 'all') {
        filtered = filtered.filter(function(transaction) {
            return transaction.category === this.filterCategory;
        }.bind(this));
    }
    
    return filtered;
};

ExpenseTracker.prototype.renderTransactions = function() {
    var transactionsList = document.getElementById('transactionsList');
    var filteredTransactions = this.getFilteredTransactions();

    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = '<div class="empty-state"><h3>No transactions found</h3><p>Add your first transaction to get started!</p></div>';
        return;
    }

    var transactionsHTML = '';
    for (var i = 0; i < filteredTransactions.length; i++) {
        var transaction = filteredTransactions[i];
        transactionsHTML += '<div class="transaction-item ' + transaction.type + '">' +
            '<div class="transaction-details">' +
                '<div class="transaction-description">' + transaction.description + '</div>' +
                '<div class="transaction-meta">' + transaction.category + ' • ' + transaction.date + '</div>' +
            '</div>' +
            '<div class="transaction-amount ' + transaction.type + '">₹' + transaction.amount.toFixed(2) + '</div>' +
            '<button class="delete-btn" onclick="tracker.deleteTransaction(' + transaction.id + ')">Delete</button>' +
        '</div>';
    }
    transactionsList.innerHTML = transactionsHTML;
};

ExpenseTracker.prototype.updateStats = function() {
    var income = 0;
    var expenses = 0;
    
    for (var i = 0; i < this.transactions.length; i++) {
        var transaction = this.transactions[i];
        if (transaction.type === 'income') {
            income += transaction.amount;
        } else {
            expenses += transaction.amount;
        }
    }
    
    var net = income - expenses;
    var filteredTransactions = this.getFilteredTransactions();

    document.getElementById('totalIncome').textContent = '₹' + income.toFixed(2);
    document.getElementById('totalExpenses').textContent = '₹' + expenses.toFixed(2);
    document.getElementById('totalTransactions').textContent = filteredTransactions.length;
    
    var netElement = document.getElementById('netIncome');
    netElement.textContent = '₹' + net.toFixed(2);
    netElement.className = 'value ' + (net >= 0 ? 'positive' : 'negative');

    this.updateCategoryBreakdown();
};

ExpenseTracker.prototype.updateCategoryBreakdown = function() {
    var categoryTotals = {};
    for (var i = 0; i < this.transactions.length; i++) {
        var transaction = this.transactions[i];
        var key = transaction.type + '-' + transaction.category;
        if (categoryTotals[key]) {
            categoryTotals[key] += transaction.amount;
        } else {
            categoryTotals[key] = transaction.amount;
        }
    }

    var breakdown = document.getElementById('categoryBreakdown');
    var breakdownHTML = '';
    for (var key in categoryTotals) {
        if (categoryTotals.hasOwnProperty(key)) {
            var parts = key.split('-');
            var type = parts[0];
            var category = parts[1];
            var typeSymbol = type === 'income' ? '+' : '-';
            var typeColor = type === 'income' ? '#28a745' : '#dc3545';
            
            breakdownHTML += '<div class="category-item">' +
                '<span>' + category + ' (' + type + ')</span>' +
                '<span style="color: ' + typeColor + '">' + typeSymbol + '₹' + categoryTotals[key].toFixed(2) + '</span>' +
            '</div>';
        }
    }
    breakdown.innerHTML = breakdownHTML;
};

// Initialize the expense tracker when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    var tracker = new ExpenseTracker();
    
    // Make tracker globally available for delete button clicks
    window.tracker = tracker;
});