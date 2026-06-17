// CPTIS Database Manager using LocalStorage

const STORAGE_KEYS = {
  PROJECTS: 'cptis_projects',
  USERS: 'cptis_users',
  INQUIRIES: 'cptis_inquiries',
  CURRENT_USER: 'cptis_current_user'
};

// Initial Mock Data including an Admin
const MOCK_USERS = [
  {
    id: 'admin_1',
    name: 'System Administrator',
    email: 'admin@cptis.edu',
    password: 'admin123',
    role: 'admin',
    department: 'Administration'
  },
  {
    id: 'prof_smith',
    name: 'Dr. Sarah Smith',
    email: 'prof.smith@cptis.edu',
    password: 'password123',
    role: 'professor',
    department: 'Computer Science'
  },
  {
    id: 'prof_chen',
    name: 'Dr. Alan Chen',
    email: 'prof.chen@cptis.edu',
    password: 'password123',
    role: 'professor',
    department: 'Electrical Engineering'
  },
  {
    id: 'prof_patel',
    name: 'Dr. Priya Patel',
    email: 'prof.patel@cptis.edu',
    password: 'password123',
    role: 'professor',
    department: 'Bioengineering'
  }
];

const MOCK_PROJECTS = [
  {
    id: 'proj_1',
    title: 'Deep Learning for Autonomous Drone Navigation in Dense Forests',
    type: 'thesis',
    department: 'Computer Science',
    description: 'This thesis aims to develop a robust deep reinforcement learning algorithm for navigating quadcopters in complex forest environments without GPS. The project involves building a high-fidelity simulator, training the model using custom neural network architectures, and deploying the model onto a physical drone for real-world testing. Strong Python and PyTorch skills are required.',
    prerequisites: 'CS 482 (Deep Learning) or equivalent, basic control systems knowledge.',
    skills: ['Python', 'PyTorch', 'ROS (Robot Operating System)', 'C++', 'Computer Vision'],
    duration: '2 Semesters',
    status: 'open',
    professorId: 'prof_smith',
    professorName: 'Dr. Sarah Smith',
    professorEmail: 'prof.smith@cptis.edu',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    views: 142
  },
  {
    id: 'proj_2',
    title: 'IoT-Enabled Smart Grid Optimization and Real-time Load Balancing',
    type: 'research',
    department: 'Electrical Engineering',
    description: 'Investigate the integration of distributed edge computing sensors to balance power loads in micro-grids dynamically. The candidate will design micro-controller firmware, set up MQTT-based communication bridges, and implement lightweight reinforcement learning algorithms at the edge. The objective is to minimize power loss by 15% under fluctuating grid loads.',
    prerequisites: 'EE 320 (Power Systems), fundamental embedded C/C++ knowledge.',
    skills: ['Embedded C/C++', 'MQTT', 'Raspberry Pi', 'Data Analysis', 'Edge Computing'],
    duration: '6 Months',
    status: 'open',
    professorId: 'prof_chen',
    professorName: 'Dr. Alan Chen',
    professorEmail: 'prof.chen@cptis.edu',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    views: 89
  },
  {
    id: 'proj_3',
    title: 'AR-Assisted Minimally Invasive Surgery Trainer',
    type: 'project',
    department: 'Bioengineering',
    description: 'Develop an interactive Augmented Reality (AR) application for Microsoft HoloLens that projects virtual anatomical overlays onto physical surgical training mannequins. This project aims to assist medical students in learning needle insertion and laparoscopic tool positioning. The applicant will work closely with medical professionals at the university hospital.',
    prerequisites: 'Experience with Unity and C#, basic understanding of 3D modeling.',
    skills: ['Unity 3D', 'C#', 'Augmented Reality', 'Medical Imaging (DICOM)', 'UI/UX Design'],
    duration: '1 Year',
    status: 'open',
    professorId: 'prof_patel',
    professorName: 'Dr. Priya Patel',
    professorEmail: 'prof.patel@cptis.edu',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    views: 215
  },
  {
    id: 'proj_4',
    title: 'Natural Language Interfaces for Database Querying (NL2SQL)',
    type: 'thesis',
    department: 'Computer Science',
    description: 'This research focuses on fine-tuning Large Language Models (LLMs) to translate complex, colloquial English questions into structured SQL queries for relational databases. We will benchmark open-source models (like Llama and Mistral) against standard schema complexities, implementing techniques like few-shot prompting and retrieval-augmented generation (RAG) to improve accuracy.',
    prerequisites: 'CS 340 (Database Systems), CS 460 (Artificial Intelligence).',
    skills: ['Python', 'LLMs (HuggingFace/OpenAI API)', 'SQL', 'Prompt Engineering', 'LangChain'],
    duration: '1 Semester',
    status: 'in-progress',
    professorId: 'prof_smith',
    professorName: 'Dr. Sarah Smith',
    professorEmail: 'prof.smith@cptis.edu',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    views: 310
  },
  {
    id: 'proj_5',
    title: 'Biodegradable Hydrogels for Targeted Drug Delivery',
    type: 'research',
    department: 'Bioengineering',
    description: 'Synthesis and characterization of biocompatible hydrogels responsive to local pH changes. The project aims to encapsulate model therapeutic proteins and measure release kinetics under simulated body conditions. This is a lab-heavy project suitable for students looking to pursue a Ph.D. in Biomaterials.',
    prerequisites: 'Organic Chemistry II, Lab Safety Certification.',
    skills: ['Biomaterials Synthesis', 'Spectroscopy', 'Data Analysis', 'Technical Writing'],
    duration: '2 Semesters',
    status: 'open',
    professorId: 'prof_patel',
    professorName: 'Dr. Priya Patel',
    professorEmail: 'prof.patel@cptis.edu',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    views: 65
  }
];

const MOCK_INQUIRIES = [
  {
    id: 'inq_1',
    projectId: 'proj_1',
    projectTitle: 'Deep Learning for Autonomous Drone Navigation in Dense Forests',
    professorId: 'prof_smith',
    studentName: 'Emily Vance',
    studentEmail: 'emily.vance@student.cptis.edu',
    studentMessage: 'Hello Dr. Smith, I have taken CS 482 and received an A. I have also built a custom drone using Betaflight and run reinforcement learning models in Gazebo. I would love to discuss this thesis idea further with you.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'inq_2',
    projectId: 'proj_3',
    projectTitle: 'AR-Assisted Minimally Invasive Surgery Trainer',
    professorId: 'prof_patel',
    studentName: 'Mark Ruelle',
    studentEmail: 'mark.ruelle@student.cptis.edu',
    studentMessage: 'Dear Dr. Patel, I am a senior Bioengineering student with a double minor in Computer Science. I have worked with Unity 3D for game development and am very interested in applying these skills to medical simulations. Do you have time for a meeting this week?',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

class Database {
  constructor() {
    this.init();
  }

  init() {
    // Check and migrate user storage
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (storedUsers) {
      try {
        let parsedUsers = JSON.parse(storedUsers);
        let needsMigration = false;

        // Check if admin is missing
        const hasAdmin = parsedUsers.some(u => u.role === 'admin' || u.email === 'admin@cptis.edu');
        if (!hasAdmin) needsMigration = true;

        // Check if role property is missing
        const missingRoles = parsedUsers.some(u => !u.role);
        if (missingRoles) needsMigration = true;

        if (needsMigration) {
          console.warn("CPTIS DB: Migrating outdated user storage schema...");
          
          parsedUsers.forEach(u => {
            if (!u.role) {
              if (u.email.toLowerCase() === 'admin@cptis.edu') {
                u.role = 'admin';
              } else {
                u.role = 'professor';
              }
            }
          });

          // Inject admin if missing completely
          const adminExists = parsedUsers.some(u => u.email.toLowerCase() === 'admin@cptis.edu');
          if (!adminExists) {
            parsedUsers.unshift({
              id: 'admin_1',
              name: 'System Administrator',
              email: 'admin@cptis.edu',
              password: 'admin123',
              role: 'admin',
              department: 'Administration'
            });
          }

          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsedUsers));
        }
      } catch (e) {
        console.error("CPTIS DB: User storage corrupt, resetting default mock users...", e);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS));
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS));
    }

    // Check and migrate current logged in user session if missing role
    const currentUserStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (currentUserStr) {
      try {
        let curUser = JSON.parse(currentUserStr);
        if (!curUser.role) {
          console.warn("CPTIS DB: Migrating active user session role...");
          const updatedUser = this.findUserByEmail(curUser.email);
          if (updatedUser) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
          } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
          }
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    }

    // Seed projects and inquiries
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(MOCK_PROJECTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INQUIRIES)) {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(MOCK_INQUIRIES));
    }
  }

  // --- Users/Auth Operations ---
  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  }

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getProfessors() {
    return this.getUsers().filter(u => u.role === 'professor');
  }

  findUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(name, email, password, department, role = 'professor') {
    const users = this.getUsers();
    if (this.findUserByEmail(email)) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = {
      id: (role === 'admin' ? 'admin_' : 'prof_') + Math.random().toString(36).substring(2, 11),
      name,
      email,
      password,
      role,
      department
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  updateProfessor(id, data) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Professor not found');
    
    users[index] = {
      ...users[index],
      name: data.name,
      email: data.email,
      department: data.department,
      password: data.password || users[index].password
    };

    const projects = this.getProjects();
    let projectsUpdated = false;
    projects.forEach(p => {
      if (p.professorId === id) {
        p.professorName = data.name;
        p.professorEmail = data.email;
        p.department = data.department;
        projectsUpdated = true;
      }
    });

    this.saveUsers(users);
    if (projectsUpdated) {
      this.saveProjects(projects);
    }
    return users[index];
  }

  deleteProfessor(id) {
    let users = this.getUsers();
    users = users.filter(u => u.id !== id);
    this.saveUsers(users);

    const projects = this.getProjects();
    const myProjects = projects.filter(p => p.professorId === id);
    myProjects.forEach(p => {
      this.deleteProject(p.id);
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;
  }

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // --- Projects Operations ---
  getProjects() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS)) || [];
  }

  saveProjects(projects) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  getProjectById(id) {
    const projects = this.getProjects();
    return projects.find(p => p.id === id);
  }

  incrementViews(id) {
    const projects = this.getProjects();
    const project = projects.find(p => p.id === id);
    if (project) {
      project.views = (project.views || 0) + 1;
      this.saveProjects(projects);
    }
  }

  createProject(projectData) {
    const projects = this.getProjects();
    const newProject = {
      id: 'proj_' + Math.random().toString(36).substring(2, 11),
      title: projectData.title,
      type: projectData.type,
      department: projectData.department,
      description: projectData.description,
      prerequisites: projectData.prerequisites,
      skills: Array.isArray(projectData.skills) 
        ? projectData.skills 
        : projectData.skills.split(',').map(s => s.trim()).filter(Boolean),
      duration: projectData.duration,
      status: projectData.status || 'open',
      professorId: projectData.professorId,
      professorName: projectData.professorName,
      professorEmail: projectData.professorEmail,
      createdAt: new Date().toISOString(),
      views: 0
    };
    projects.unshift(newProject);
    this.saveProjects(projects);
    return newProject;
  }

  updateProject(id, projectData) {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found');
    }
    
    projects[index] = {
      ...projects[index],
      title: projectData.title,
      type: projectData.type,
      department: projectData.department,
      description: projectData.description,
      prerequisites: projectData.prerequisites,
      skills: Array.isArray(projectData.skills) 
        ? projectData.skills 
        : projectData.skills.split(',').map(s => s.trim()).filter(Boolean),
      duration: projectData.duration,
      status: projectData.status || projects[index].status
    };

    if (projectData.professorId) {
      projects[index].professorId = projectData.professorId;
      projects[index].professorName = projectData.professorName;
      projects[index].professorEmail = projectData.professorEmail;
    }
    
    this.saveProjects(projects);
    return projects[index];
  }

  deleteProject(id) {
    let projects = this.getProjects();
    projects = projects.filter(p => p.id !== id);
    this.saveProjects(projects);

    let inquiries = this.getInquiries();
    inquiries = inquiries.filter(i => i.projectId !== id);
    this.saveInquiries(inquiries);
  }

  // --- Inquiries Operations ---
  getInquiries() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES)) || [];
  }

  saveInquiries(inquiries) {
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
  }

  createInquiry(inquiryData) {
    const inquiries = this.getInquiries();
    const newInquiry = {
      id: 'inq_' + Math.random().toString(36).substring(2, 11),
      projectId: inquiryData.projectId,
      projectTitle: inquiryData.projectTitle,
      professorId: inquiryData.professorId,
      studentName: inquiryData.studentName,
      studentEmail: inquiryData.studentEmail,
      studentMessage: inquiryData.studentMessage,
      createdAt: new Date().toISOString()
    };
    inquiries.unshift(newInquiry);
    this.saveInquiries(inquiries);
    return newInquiry;
  }

  getInquiriesForProfessor(professorId) {
    const inquiries = this.getInquiries();
    return inquiries.filter(i => i.professorId === professorId);
  }

  deleteInquiry(id) {
    let inquiries = this.getInquiries();
    inquiries = inquiries.filter(i => i.id !== id);
    this.saveInquiries(inquiries);
  }
}

export const db = new Database();
