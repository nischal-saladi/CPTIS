import { db } from './db.js';

// Authentication functions
export const auth = {
  login(email, password) {
    const user = db.findUserByEmail(email);
    if (!user) {
      throw new Error('No account found with this email.');
    }
    if (user.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }
    db.setCurrentUser(user);
    return user;
  },

  register(name, email, password, department) {
    if (!name || !email || !password || !department) {
      throw new Error('All fields are required.');
    }
    if (!email.includes('@') || !email.includes('.')) {
      throw new Error('Please enter a valid email address.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    
    const newUser = db.createUser(name, email, password, department, 'professor');
    db.setCurrentUser(newUser);
    return newUser;
  },

  logout() {
    db.setCurrentUser(null);
    window.location.href = 'index.html';
  },

  getCurrentUser() {
    return db.getCurrentUser();
  },

  requireAuth() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      window.location.href = 'login.html';
      return null;
    }
    if (currentUser.role !== 'professor') {
      // If an admin attempts to access professor dashboard, redirect appropriately
      window.location.href = 'admin-dashboard.html';
      return null;
    }
    return currentUser;
  },

  requireAdminAuth() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      window.location.href = 'admin-login.html';
      return null;
    }
    if (currentUser.role !== 'admin') {
      window.location.href = 'login.html';
      return null;
    }
    return currentUser;
  },

  redirectIfLoggedIn() {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      if (currentUser.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    }
  }
};
