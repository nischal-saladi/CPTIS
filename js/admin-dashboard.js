import { db } from './db.js';
import { auth } from './auth.js';
import { showToast } from './toast.js';

// Auth Guard
let currentAdmin = null;

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const statProfessors = document.getElementById('statProfessors');
const statProposals = document.getElementById('statProposals');
const statInquiries = document.getElementById('statInquiries');

// Tab Controls
const tabBtns = document.querySelectorAll('.tab-btn');
const sections = document.querySelectorAll('.dashboard-section');

// Table Bodies
const professorsTableBody = document.getElementById('professorsTableBody');
const projectsTableBody = document.getElementById('projectsTableBody');
const inquiriesTableBody = document.getElementById('inquiriesTableBody');

// Professor Modal & Form
const profModal = document.getElementById('profModal');
const addProfessorBtn = document.getElementById('addProfessorBtn');
const closeProfModalBtn = document.getElementById('closeProfModalBtn');
const cancelProfBtn = document.getElementById('cancelProfBtn');
const profForm = document.getElementById('profForm');
const profModalTitle = document.getElementById('profModalTitle');
const saveProfBtn = document.getElementById('saveProfBtn');

const fieldProfName = document.getElementById('profName');
const fieldProfDept = document.getElementById('profDept');
const fieldProfEmail = document.getElementById('profEmail');
const fieldProfPassword = document.getElementById('profPassword');

// Project Edit Modal & Form (Admin)
const adminProjectModal = document.getElementById('adminProjectModal');
const closeProjModalBtn = document.getElementById('closeProjModalBtn');
const cancelProjBtn = document.getElementById('cancelProjBtn');
const adminProjectForm = document.getElementById('adminProjectForm');

const fieldProjTitle = adminProjectForm.querySelector('#projTitle');
const fieldProjType = adminProjectForm.querySelector('#projType');
const fieldProjAdvisor = adminProjectForm.querySelector('#projAdvisor');
const fieldProjDuration = adminProjectForm.querySelector('#projDuration');
const fieldProjStatus = adminProjectForm.querySelector('#projStatus');
const fieldProjSkills = adminProjectForm.querySelector('#projSkills');
const fieldProjPrereqs = adminProjectForm.querySelector('#projPrereqs');
const fieldProjDesc = adminProjectForm.querySelector('#projDesc');

// State Manager
let isEditingProf = false;
let editingProfId = null;

let isEditingProj = false;
let editingProjId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  currentAdmin = auth.requireAdminAuth();
  if (!currentAdmin) return; // Guard clause

  refreshAdminDashboard();
  setupEventListeners();
});

// Refresh stats and all lists
function refreshAdminDashboard() {
  const professors = db.getProfessors();
  const projects = db.getProjects();
  const inquiries = db.getInquiries();

  statProfessors.textContent = professors.length;
  statProposals.textContent = projects.length;
  statInquiries.textContent = inquiries.length;

  renderProfessorsTable(professors, projects);
  renderProjectsTable(projects);
  renderInquiriesTable(inquiries);
  populateAdvisorDropdown(professors);
}

// Render Professors Table
function renderProfessorsTable(professors, projects) {
  professorsTableBody.innerHTML = '';

  if (professors.length === 0) {
    professorsTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
          No professor accounts registered in the database.
        </td>
      </tr>
    `;
    return;
  }

  professors.forEach(prof => {
    // Count advisor proposals
    const countProposals = projects.filter(p => p.professorId === prof.id).length;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div style="font-weight: 600; font-size: 1rem; color: var(--text-primary);">${prof.name}</div>
        <span style="font-size: 0.75rem; color: var(--text-muted);">ID: ${prof.id}</span>
      </td>
      <td>
        <span style="font-weight: 500;">${prof.department}</span>
      </td>
      <td>
        <span>${prof.email}</span>
      </td>
      <td>
        <span style="font-weight: 600; color: var(--accent);">${countProposals} Projects</span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary edit-prof-btn" style="padding: 6px 12px; font-size: 0.8rem;">Edit</button>
          <button class="btn btn-danger delete-prof-btn" style="padding: 6px 12px; font-size: 0.8rem;">Remove</button>
        </div>
      </td>
    `;

    row.querySelector('.edit-prof-btn').addEventListener('click', () => {
      openEditProfModal(prof);
    });

    row.querySelector('.delete-prof-btn').addEventListener('click', () => {
      confirmAndDeleteProf(prof.id, prof.name);
    });

    professorsTableBody.appendChild(row);
  });
}

// Render Projects Table
function renderProjectsTable(projects) {
  projectsTableBody.innerHTML = '';

  if (projects.length === 0) {
    projectsTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
          No project proposals have been created yet.
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
        <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary); max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${project.title}
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
          Created: ${new Date(project.createdAt).toLocaleDateString()}
        </div>
      </td>
      <td>
        <div style="font-size: 0.9rem; font-weight: 500;">${project.professorName}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${project.department}</div>
      </td>
      <td>
        <span style="font-size: 0.85rem;">${typeLabel}</span>
      </td>
      <td>
        <span class="badge ${badgeClass}">${project.status}</span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary edit-proj-btn" style="padding: 6px 12px; font-size: 0.8rem;">Edit</button>
          <button class="btn btn-danger delete-proj-btn" style="padding: 6px 12px; font-size: 0.8rem;">Delete</button>
        </div>
      </td>
    `;

    row.querySelector('.edit-proj-btn').addEventListener('click', () => {
      openEditProjModal(project);
    });

    row.querySelector('.delete-proj-btn').addEventListener('click', () => {
      confirmAndDeleteProject(project.id, project.title);
    });

    projectsTableBody.appendChild(row);
  });
}

// Render Student Inquiries Table
function renderInquiriesTable(inquiries) {
  inquiriesTableBody.innerHTML = '';

  if (inquiries.length === 0) {
    inquiriesTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 40px 20px;">
          No student inquiry forms have been submitted yet.
        </td>
      </tr>
    `;
    return;
  }

  inquiries.forEach(inq => {
    const row = document.createElement('tr');

    const mailtoSubject = encodeURIComponent(`Inquiry Follow-up: ${inq.projectTitle}`);
    const mailtoBody = encodeURIComponent(`Hi ${inq.studentName},\n\nThis is CPTIS Administration following up on your proposal inquiry...`);
    const replyLink = `mailto:${inq.studentEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

    row.innerHTML = `
      <td>
        <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">${inq.studentName}</div>
        <div style="font-size: 0.8rem; color: var(--secondary);">${inq.studentEmail}</div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px; font-style: italic; max-width: 320px; word-wrap: break-word; white-space: normal;">
          "${inq.studentMessage}"
        </p>
      </td>
      <td>
        <div style="font-size: 0.9rem; font-weight: 500; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${inq.projectTitle}">
          ${inq.projectTitle}
        </div>
      </td>
      <td>
        <span style="font-size: 0.9rem;">${db.getProjectById(inq.projectId)?.professorName || 'Advisor Removed'}</span>
      </td>
      <td>
        <span style="font-size: 0.8rem; color: var(--text-muted);">${new Date(inq.createdAt).toLocaleDateString()}</span>
      </td>
      <td>
        <div class="table-actions" style="flex-direction: column; gap: 6px;">
          <a href="${replyLink}" class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem; text-align: center;">Email</a>
          <button class="btn btn-danger delete-inq-btn" style="padding: 4px 8px; font-size: 0.75rem;">Delete</button>
        </div>
      </td>
    `;

    row.querySelector('.delete-inq-btn').addEventListener('click', () => {
      if (confirm('Delete this student inquiry? This action is permanent.')) {
        db.deleteInquiry(inq.id);
        showToast('Inquiry deleted successfully.', 'success');
        refreshAdminDashboard();
      }
    });

    inquiriesTableBody.appendChild(row);
  });
}

// Populate advisor list dropdown select
function populateAdvisorDropdown(professors) {
  fieldProjAdvisor.innerHTML = '';
  professors.forEach(prof => {
    const opt = document.createElement('option');
    opt.value = prof.id;
    opt.textContent = `${prof.name} (${prof.department})`;
    fieldProjAdvisor.appendChild(opt);
  });
}

// Professor Modal controls
function openAddProfModal() {
  isEditingProf = false;
  editingProfId = null;
  profForm.reset();

  profModalTitle.textContent = 'Add Professor Account';
  fieldProfPassword.required = true;
  fieldProfPassword.placeholder = 'Minimum 6 characters';
  saveProfBtn.textContent = 'Create Account';

  profModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openEditProfModal(prof) {
  isEditingProf = true;
  editingProfId = prof.id;
  
  fieldProfName.value = prof.name;
  fieldProfDept.value = prof.department;
  fieldProfEmail.value = prof.email;
  fieldProfPassword.required = false; // Optional password during edits
  fieldProfPassword.placeholder = 'Leave blank to keep current password';

  profModalTitle.textContent = 'Edit Professor Account';
  saveProfBtn.textContent = 'Save Changes';

  profModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProfModal() {
  profModal.classList.remove('active');
  document.body.style.overflow = '';
}

function confirmAndDeleteProf(id, name) {
  if (confirm(`Remove Dr./Prof. ${name}?\nWARNING: This will permanently delete all of this professor's proposals and student inquiries.`)) {
    db.deleteProfessor(id);
    showToast('Professor account removed.', 'success');
    refreshAdminDashboard();
  }
}

// Project Modal controls
function openEditProjModal(project) {
  isEditingProj = true;
  editingProjId = project.id;

  fieldProjTitle.value = project.title;
  fieldProjType.value = project.type;
  fieldProjAdvisor.value = project.professorId;
  fieldProjDuration.value = project.duration;
  fieldProjStatus.value = project.status;
  fieldProjSkills.value = project.skills.join(', ');
  fieldProjPrereqs.value = project.prerequisites || '';
  fieldProjDesc.value = project.description;

  adminProjectModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProjModal() {
  adminProjectModal.classList.remove('active');
  document.body.style.overflow = '';
}

function confirmAndDeleteProject(id, title) {
  if (confirm(`Permanently delete this proposal:\n"${title}"?\nThis also deletes student inquiries for this project.`)) {
    db.deleteProject(id);
    showToast('Proposal deleted successfully.', 'success');
    refreshAdminDashboard();
  }
}

// Event Listeners Hooks
function setupEventListeners() {
  // Tabs switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionId = btn.dataset.section;

      tabBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(sectionId).classList.add('active');
    });
  });

  // Modal openings
  addProfessorBtn.addEventListener('click', openAddProfModal);
  closeProfModalBtn.addEventListener('click', closeProfModal);
  cancelProfBtn.addEventListener('click', closeProfModal);
  profModal.addEventListener('click', (e) => {
    if (e.target === profModal) closeProfModal();
  });

  closeProjModalBtn.addEventListener('click', closeProjModal);
  cancelProjBtn.addEventListener('click', closeProjModal);
  adminProjectModal.addEventListener('click', (e) => {
    if (e.target === adminProjectModal) closeProjModal();
  });

  // Logout action
  logoutBtn.addEventListener('click', () => {
    auth.logout();
  });

  // Professor Form Submit
  profForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = fieldProfName.value;
    const dept = fieldProfDept.value;
    const email = fieldProfEmail.value;
    const password = fieldProfPassword.value;

    try {
      if (isEditingProf) {
        db.updateProfessor(editingProfId, { name, email, department: dept, password });
        showToast('Professor profile updated.', 'success');
      } else {
        db.createUser(name, email, password, dept, 'professor');
        showToast('Professor account created.', 'success');
      }
      closeProfModal();
      refreshAdminDashboard();
    } catch (err) {
      showToast('Error saving account: ' + err.message, 'error');
    }
  });

  // Project Form Submit (Admin)
  adminProjectForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const advisorId = fieldProjAdvisor.value;
    // Find advisor details
    const advisor = db.getUsers().find(u => u.id === advisorId);
    if (!advisor) {
      showToast('Selected advisor is invalid', 'error');
      return;
    }

    const projectData = {
      title: fieldProjTitle.value,
      type: fieldProjType.value,
      department: advisor.department, // Align dept with selected advisor
      duration: fieldProjDuration.value,
      status: fieldProjStatus.value,
      skills: fieldProjSkills.value,
      prerequisites: fieldProjPrereqs.value,
      description: fieldProjDesc.value,
      // Denormalized advisor fields
      professorId: advisor.id,
      professorName: advisor.name,
      professorEmail: advisor.email
    };

    try {
      db.updateProject(editingProjId, projectData);
      showToast('Proposal updated successfully!', 'success');
      closeProjModal();
      refreshAdminDashboard();
    } catch (err) {
      showToast('Error updating proposal: ' + err.message, 'error');
    }
  });
}
