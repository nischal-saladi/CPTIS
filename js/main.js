import { db } from './db.js';
import { auth } from './auth.js';
import { showToast } from './toast.js';

// DOM Elements
const projectsGrid = document.getElementById('projectsGrid');
const searchInput = document.getElementById('searchInput');
const deptFilter = document.getElementById('deptFilter');
const typeFilter = document.getElementById('typeFilter');
const statusFilter = document.getElementById('statusFilter');
const sortBy = document.getElementById('sortBy');
const loginBtn = document.getElementById('loginBtn');

// Modal Elements
const detailsModal = document.getElementById('detailsModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalBadge = document.getElementById('modalBadge');
const modalTitle = document.getElementById('modalTitle');
const modalDept = document.getElementById('modalDept');
const modalProfName = document.getElementById('modalProfName');
const modalDuration = document.getElementById('modalDuration');
const modalProfEmail = document.getElementById('modalProfEmail');
const modalDesc = document.getElementById('modalDesc');
const modalPrereqs = document.getElementById('modalPrereqs');
const modalSkills = document.getElementById('modalSkills');
const inquiryBox = document.getElementById('inquiryBox');
const inquiryForm = document.getElementById('inquiryForm');

// State
let activeProjectId = null;

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
  setupNavbar();
  renderProjects();
  setupEventListeners();
});

// Setup Navbar depending on login state
function setupNavbar() {
  const currentUser = auth.getCurrentUser();
  if (currentUser) {
    loginBtn.textContent = 'Dashboard';
    loginBtn.href = 'dashboard.html';
    
    // Add logout option to nav
    const navLinks = document.querySelector('.nav-links');
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn btn-outline';
    logoutBtn.style.padding = '8px 16px';
    logoutBtn.style.fontSize = '0.9rem';
    logoutBtn.textContent = 'Logout';
    logoutBtn.addEventListener('click', () => {
      auth.logout();
    });
    navLinks.appendChild(logoutBtn);
  }
}

// Render Project Cards to Grid
function renderProjects() {
  const allProjects = db.getProjects();
  const searchVal = searchInput.value.toLowerCase().trim();
  const deptVal = deptFilter.value;
  const typeVal = typeFilter.value;
  const statusVal = statusFilter.value;
  const sortVal = sortBy.value;

  // Filter projects
  let filtered = allProjects.filter(project => {
    // Search keyword match (title, desc, skills, professor)
    const matchesSearch = !searchVal || 
      project.title.toLowerCase().includes(searchVal) ||
      project.description.toLowerCase().includes(searchVal) ||
      project.professorName.toLowerCase().includes(searchVal) ||
      project.skills.some(skill => skill.toLowerCase().includes(searchVal));

    // Department match
    const matchesDept = deptVal === 'all' || project.department === deptVal;

    // Type match
    const matchesType = typeVal === 'all' || project.type === typeVal;

    // Status match
    const matchesStatus = statusVal === 'all' || project.status === statusVal;

    return matchesSearch && matchesDept && matchesType && matchesStatus;
  });

  // Sort projects
  if (sortVal === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortVal === 'views') {
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
  }

  // Clear grid
  projectsGrid.innerHTML = '';

  // Render empty state if no projects match
  if (filtered.length === 0) {
    projectsGrid.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 15px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h3>No projects found</h3>
        <p>Try resetting filters or adjusting your search keywords.</p>
      </div>
    `;
    return;
  }

  // Render cards
  filtered.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.id = project.id;

    // Status badge class
    let badgeClass = 'badge-open';
    if (project.status === 'in-progress') badgeClass = 'badge-progress';
    if (project.status === 'completed') badgeClass = 'badge-completed';

    // Format type text
    const typeLabel = project.type.charAt(0).toUpperCase() + project.type.slice(1);

    card.innerHTML = `
      <div>
        <div class="card-header">
          <div class="type-dept">
            <span class="project-type">${typeLabel}</span>
            <span class="project-dept">${project.department}</span>
          </div>
          <span class="badge ${badgeClass}">${project.status}</span>
        </div>
        <h3 class="project-title" title="${project.title}">${project.title}</h3>
        <p class="project-desc">${project.description}</p>
        <div class="project-tags">
          ${project.skills.slice(0, 3).map(skill => `<span class="tag">${skill}</span>`).join('')}
          ${project.skills.length > 3 ? `<span class="tag">+${project.skills.length - 3} more</span>` : ''}
        </div>
      </div>
      <div class="card-footer">
        <div class="professor-info">
          <span class="prof-name">${project.professorName}</span>
          <span class="prof-label">Advisor</span>
        </div>
        <button class="btn btn-outline view-details-btn" style="padding: 6px 14px; font-size: 0.85rem;">View Details</button>
      </div>
    `;

    // Click behavior
    card.querySelector('.view-details-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openDetailsModal(project.id);
    });
    card.addEventListener('click', () => {
      openDetailsModal(project.id);
    });

    projectsGrid.appendChild(card);
  });
}

// Open Details Modal and populate details
function openDetailsModal(id) {
  activeProjectId = id;
  db.incrementViews(id); // Increment view count

  const project = db.getProjectById(id);
  if (!project) return;

  // Set modal text content
  modalTitle.textContent = project.title;
  modalDept.textContent = project.department;
  modalProfName.textContent = project.professorName;
  modalDuration.textContent = project.duration;
  modalProfEmail.textContent = project.professorEmail;
  modalDesc.textContent = project.description;
  modalPrereqs.textContent = project.prerequisites || 'None specified.';
  
  // Set badge status
  modalBadge.textContent = project.type.toUpperCase();
  modalBadge.className = 'badge'; // Reset classes
  if (project.status === 'open') modalBadge.classList.add('badge-open');
  if (project.status === 'in-progress') modalBadge.classList.add('badge-progress');
  if (project.status === 'completed') modalBadge.classList.add('badge-completed');

  // Render skills tags
  modalSkills.innerHTML = '';
  project.skills.forEach(skill => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = skill;
    modalSkills.appendChild(tag);
  });

  // Toggle interest inquiry form depending on open status
  if (project.status === 'open') {
    inquiryBox.style.display = 'block';
    inquiryForm.reset();
  } else {
    inquiryBox.style.display = 'none';
  }

  // Show Modal
  detailsModal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Stop background scrolling
}

// Close Modal
function closeDetailsModal() {
  detailsModal.classList.remove('active');
  document.body.style.overflow = '';
  activeProjectId = null;
  renderProjects(); // Re-render to update the views counter on the card list
}

// Setup Event Listeners
function setupEventListeners() {
  // Filters and search
  searchInput.addEventListener('input', renderProjects);
  deptFilter.addEventListener('change', renderProjects);
  typeFilter.addEventListener('change', renderProjects);
  statusFilter.addEventListener('change', renderProjects);
  sortBy.addEventListener('change', renderProjects);

  // Close modal actions
  closeModalBtn.addEventListener('click', closeDetailsModal);
  detailsModal.addEventListener('click', (e) => {
    if (e.target === detailsModal) closeDetailsModal();
  });

  // Esc key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && detailsModal.classList.contains('active')) {
      closeDetailsModal();
    }
  });

  // Inquiry Form Submission
  inquiryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!activeProjectId) return;

    const project = db.getProjectById(activeProjectId);
    if (!project) return;

    const studentName = document.getElementById('studentName').value;
    const studentEmail = document.getElementById('studentEmail').value;
    const studentMessage = document.getElementById('studentMessage').value;

    try {
      db.createInquiry({
        projectId: project.id,
        projectTitle: project.title,
        professorId: project.professorId,
        studentName,
        studentEmail,
        studentMessage
      });

      showToast('Success! Your inquiry has been sent to ' + project.professorName, 'success');
      setTimeout(() => {
        closeDetailsModal();
      }, 1500);
    } catch (err) {
      showToast('Error sending inquiry: ' + err.message, 'error');
    }
  });
}


