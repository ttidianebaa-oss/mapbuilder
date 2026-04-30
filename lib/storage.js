const STORAGE_KEY = 'mapbuilder_projects';

export function getProjects() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getProject(id) {
  return getProjects().find(p => p.id === id) || null;
}

export function saveProject(project) {
  const projects = getProjects();
  const idx = projects.findIndex(p => p.id === project.id);
  const updated = { ...project, updatedAt: new Date().toISOString() };
  if (idx >= 0) projects[idx] = updated;
  else projects.unshift(updated);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return updated;
}

export function deleteProject(id) {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function createProject(name) {
  const project = {
    id: crypto.randomUUID(),
    name,
    modules: {
      m1: { status: 'available', data: null },
      m2: { status: 'locked', data: null },
      m3: { status: 'locked', data: null },
      m4: { status: 'locked', data: null },
      m5: { status: 'locked', data: null },
      m6: { status: 'locked', data: null },
      m7: { status: 'locked', data: null },
      m8: { status: 'locked', data: null },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return saveProject(project);
}
