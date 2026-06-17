import { db } from './db.js';
import { auth } from './auth.js';
import { showToast } from './toast.js';

// Auth Guard
let currentUser = null;

// DOM Elements
const welcomeTitle = document.getElementById('welcomeTitle');
const profDeptSubtitle = document.getElementById('profDeptSubtitle');
const logoutBtn = document.getElementById('logoutBtn');

// Stats Elements
const statTotalProjects = document.getElementById('statTotalProjects');
const statActiveProjects = document.getElementById('statActiveProjects');
const statInquiries = document.getElementById('statInquiries');

// Tab Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const sections = document.querySelectorAll('.dashboard-section');

// List Containers
const projectsTableBody = document.getElementById('projectsTableBody');
const inquiriesListContainer = document.getElementById('inquiriesListContainer');

// Modal & Form Elements
const projectModal = document.getElementById('projectModal');
const createNewProjectBtn = document.getElementById('createNewProjectBtn');
const closeProjectModalBtn = document.getElementById('closeProjectModalBtn');
const cancelProjectBtn = document.getElementById('cancelProjectBtn');
const projectForm = document.getElementById('projectForm');
const projectModalTitle = document.getElementById('projectModalTitle');
const statusGroup = document.getElementById('statusGroup');
const saveProjectBtn = document.getElementById('saveProjectBtn');

// Form Fields
const fieldTitle = document.getElementById('projTitle');
const fieldType = document.getElementById('projType');
const fieldDept = document.getElementById('projDept');
const fieldDuration = document.getElementById('projDuration');
const fieldStatus = document.getElementById('projStatus');
const fieldSkills = document.getElementById('projSkills');
const fieldPrereqs = document.getElementById('projPrereqs');
const fieldDesc = document.getElementById('projDesc');

// State Manager
let isEditing = false;
let editingProjectId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  currentUser = auth.requireAuth();
  if (!currentUser) return; // Guard clause

  setupDashboardHeader();
  refreshDashboard();
  setupEventListeners();
});

// Setup Welcomes
function setupDashboardHeader() {
  welcomeTitle.textContent = `Welcome, ${currentUser.name}`;
  profDeptSubtitle.textContent = `Department of ${currentUser.department}`;
}

// Reload all data, stats, and DOM structures
function refreshDashboard() {
  const allProjects = db.getProjects();
  const myProjects = allProjects.filter(p => p.professorId === currentUser.id);
  const myInquiries = db.getInquiriesForProfessor(currentUser.id);
  const activeProposals = myProjects.filter(p => p.status === 'open');

  // Set Stats
  statTotalProjects.textContent = myProjects.length;
  statActiveProjects.textContent = activeProposals.length;
  statInquiries.textContent = myInquiries.length;

  renderProjectsTable(myProjects);
  renderInquiriesList(myInquiries);
}

// Render My Projects Table
function renderProjectsTable(projects) {
  projectsTableBody.innerHTML = '';

  if (projects.length === 0) {
    projectsTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
          You haven't posted any proposals yet. Click "Create New Proposal" to get started!
        </td>
      </tr>
    `;
    return;
  }

  projects.forEach(project => {
    const row = document.createElement('tr');

    let badgeClass = 'badge-open';
    if (project.status === 'in-progress') badgeClass = 'badge-progress';
    if (project.status === 'completed') badgeClass = 'badge-completed';

    const typeLabel = project.type.charAt(0).toUpperCase() + project.type.slice(1);

    row.innerHTML = `
      <td>
        <div style="font-weight: 600; font-size: 1rem; color: var(--text-primary); max-width: 450px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${project.title}
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
          Created: ${new Date(project.createdAt).toLocaleDateString()} &nbsp;|&nbsp; Dept: ${project.department}
        </div>
      </td>
      <td>
        <span style="font-size: 0.85rem; font-weight: 500;">${typeLabel}</span>
      </td>
      <td>
        <span class="badge ${badgeClass}">${project.status}</span>
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 5px; color: var(--text-secondary); font-size: 0.85rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          ${project.views || 0}
        </div>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary edit-btn" style="padding: 6px 12px; font-size: 0.8rem;">Edit</button>
          <button class="btn btn-danger delete-btn" style="padding: 6px 12px; font-size: 0.8rem;">Delete</button>
        </div>
      </td>
    `;

    // Hook buttons
    row.querySelector('.edit-btn').addEventListener('click', () => {
      openEditModal(project);
    });

    row.querySelector('.delete-btn').addEventListener('click', () => {
      confirmAndDeleteProject(project.id, project.title);
    });

    projectsTableBody.appendChild(row);
  });
}

// Render Inquiries list
function renderInquiriesList(inquiries) {
  inquiriesListContainer.innerHTML = '';

  if (inquiries.length === 0) {
    inquiriesListContainer.innerHTML = `
      <div class="empty-state" style="padding: 40px 20px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        <h3>No student inquiries received yet</h3>
        <p>Once a student submits an interest form on the public page, it will display here.</p>
      </div>
    `;
    return;
  }

  inquiries.forEach(inq => {
    const card = document.createElement('div');
    card.className = 'inquiry-card';
    
    // Create mailto link for easier direct communication
    const mailtoSubject = encodeURIComponent(`Inquiry Response: ${inq.projectTitle}`);
    const mailtoBody = encodeURIComponent(`Hi ${inq.studentName},\n\nThank you for expressing interest in the project "${inq.projectTitle}". I read your credentials and...`);
    const replyLink = `mailto:${inq.studentEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

    card.innerHTML = `
      <div class="inquiry-header">
        <div class="inquiry-student-info">
          <h4>${inq.studentName}</h4>
          <p>${inq.studentEmail}</p>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end;">
          <span class="inquiry-date">${new Date(inq.createdAt).toLocaleDateString()}</span>
          <a href="${replyLink}" class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem; margin-top: 8px; font-weight:600;">Reply by Email</a>
        </div>
      </div>
      <div class="inquiry-project-title">
        Proposal: ${inq.projectTitle}
      </div>
      <div class="inquiry-message">${inq.studentMessage}</div>
    `;

    inquiriesListContainer.appendChild(card);
  });
}

// Open modal in Create mode
function openCreateModal() {
  isEditing = false;
  editingProjectId = null;
  projectForm.reset();
  
  // Default department to Professor's own department
  fieldDept.value = currentUser.department;

  projectModalTitle.textContent = 'Create Project Proposal';
  statusGroup.style.display = 'none'; // No status configuration during initial creation
  saveProjectBtn.textContent = 'Publish Proposal';
  
  projectModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Open modal in Edit mode
function openEditModal(project) {
  isEditing = true;
  editingProjectId = project.id;
  
  // Pre-fill values
  fieldTitle.value = project.title;
  fieldType.value = project.type;
  fieldDept.value = project.department;
  fieldDuration.value = project.duration;
  fieldStatus.value = project.status;
  fieldSkills.value = project.skills.join(', ');
  fieldPrereqs.value = project.prerequisites || '';
  fieldDesc.value = project.description;

  projectModalTitle.textContent = 'Edit Project Proposal';
  statusGroup.style.display = 'block'; // Allow status changes on edits
  saveProjectBtn.textContent = 'Save Changes';

  projectModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close Project Modal
function closeProjectModal() {
  projectModal.classList.remove('active');
  document.body.style.overflow = '';
}

// Confirm and execute project delete
function confirmAndDeleteProject(id, title) {
  const truncatedTitle = title.length > 40 ? title.substring(0, 37) + '...' : title;
  if (confirm(`Are you sure you want to permanently delete the proposal:\n"${truncatedTitle}"?\nThis will also delete any student inquiries for this project.`)) {
    db.deleteProject(id);
    showToast('Proposal deleted successfully.', 'success');
    refreshDashboard();
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Tabs switcher
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetSectionId = btn.dataset.section;

      tabBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetSectionId).classList.add('active');
    });
  });

  // Modal open/close hooks
  createNewProjectBtn.addEventListener('click', openCreateModal);
  closeProjectModalBtn.addEventListener('click', closeProjectModal);
  cancelProjectBtn.addEventListener('click', closeProjectModal);
  projectModal.addEventListener('click', (e) => {
    if (e.target === projectModal) closeProjectModal();
  });

  // Logout hook
  logoutBtn.addEventListener('click', () => {
    auth.logout();
  });

  // Form submit hook
  projectForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const projectData = {
      title: fieldTitle.value,
      type: fieldType.value,
      department: fieldDept.value,
      duration: fieldDuration.value,
      skills: fieldSkills.value,
      prerequisites: fieldPrereqs.value,
      description: fieldDesc.value,
      status: isEditing ? fieldStatus.value : 'open',
      professorId: currentUser.id,
      professorName: currentUser.name,
      professorEmail: currentUser.email
    };

    try {
      if (isEditing) {
        db.updateProject(editingProjectId, projectData);
        showToast('Proposal updated successfully!', 'success');
      } else {
        db.createProject(projectData);
        showToast('Proposal published successfully!', 'success');
      }
      closeProjectModal();
      refreshDashboard();
    } catch (err) {
      showToast('Error saving proposal: ' + err.message, 'error');
    }
  });
}
