const USER = 'i-damale';
const apiBase = 'https://api.github.com';
const projectsGrid = document.getElementById('projects-grid');
const projectsEmpty = document.getElementById('projects-empty');
const profileSection = document.getElementById('profile');
const avatarImg = document.getElementById('avatar');
const nameEl = document.getElementById('name');
const bioEl = document.getElementById('bio');
const statsEl = document.getElementById('stats');
const cloudRegions = document.getElementById('cloud-regions');
const cloudContainers = document.getElementById('cloud-containers');
const cloudServices = document.getElementById('cloud-services');
const btnRefresh = document.getElementById('btn-refresh');

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

function createNodeFromTemplate() {
  const tpl = document.getElementById('project-card-template');
  return tpl.content.firstElementChild.cloneNode(true);
}

function safeText(text) {
  return text == null ? '' : String(text);
}

async function fetchUser() {
  try {
    const user = await fetchJSON(`${apiBase}/users/${USER}`);
    avatarImg.src = user.avatar_url;
    nameEl.textContent = user.name || user.login;
    bioEl.textContent = user.bio || 'DevOps, Cloud & Automation enthusiast';
    statsEl.innerHTML = `
      <div class="stat">Repos: ${user.public_repos}</div>
      <div class="stat">Followers: ${user.followers}</div>
      <div class="stat">Following: ${user.following}</div>
    `;
  } catch (err) {
    console.error('User fetch error', err);
    nameEl.textContent = USER;
    bioEl.textContent = 'Unable to fetch profile — you might be rate-limited by GitHub.';
  }
}

/**
 * Try to fetch a README raw content using default branch, fallback gracefully.
 */
async function fetchReadmeRaw(owner, repo, defaultBranch) {
  const urls = [
    `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/README.md`,
    `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/README.MD`,
    `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/readme.md`,
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u);
      if (!res.ok) continue;
      const text = await res.text();
      return text;
    } catch (err) {
      // continue
    }
  }
  return null;
}

/**
 * Main projects fetcher - grabs public repos, filters and populates cards.
 */
async function fetchProjects() {
  projectsGrid.innerHTML = '';
  projectsEmpty.classList.remove('hidden');
  try {
    // fetch repos (public)
    const repos = await fetchJSON(`${apiBase}/users/${USER}/repos?per_page=100&sort=pushed`);
    // basic cloud snapshot: crafted from repo topics (heuristic)
    let regions = new Set(), containers = 0, services = 0;

    const filtered = repos
      .filter(r => !r.fork && !r.archived)
      .sort((a,b) => b.stargazers_count - a.stargazers_count);

    if (!filtered.length) {
      projectsEmpty.textContent = 'No suitable projects found in your GitHub profile.';
      return;
    }

    projectsEmpty.classList.add('hidden');

    // process each repo - limit to 50 for performance
    for (const repo of filtered.slice(0, 50)) {
      const node = createNodeFromTemplate();
      node.querySelector('.project-name').textContent = repo.name;
      node.querySelector('.project-desc').textContent = repo.description || '—';
      node.querySelector('.lang').textContent = repo.language || '';
      node.querySelector('.star-count').textContent = repo.stargazers_count || 0;

      const repoLink = node.querySelector('.repo-link');
      repoLink.href = repo.html_url;
      repoLink.title = 'Open repository';

      const demoLink = node.querySelector('.demo-link');
      if (repo.homepage) {
        demoLink.href = repo.homepage;
        demoLink.classList.remove('hidden');
      } else {
        demoLink.classList.add('hidden');
      }

      const readmeLink = node.querySelector('.readme-link');
      const branch = repo.default_branch || 'main';

      // add tags
      const tagsContainer = node.querySelector('.project-tags');
      if (repo.topics && repo.topics.length){
        repo.topics.slice(0,6).forEach(t=>{
          const tEl = document.createElement('span');
          tEl.className = 'tag';
          tEl.textContent = t;
          tagsContainer.appendChild(tEl);

          // heuristics for cloud snapshot
          if (t.toLowerCase().includes('aws') || t.toLowerCase().includes('azure') || t.toLowerCase().includes('gcp')) {
            regions.add(t);
            services++;
          }
          if (t.toLowerCase().includes('docker') || t.toLowerCase().includes('k8s') || t.toLowerCase().includes('kubernetes')) {
            containers++;
          }
        });
      }

      // attempt to attach short readme preview asynchronously
      (async () => {
        try {
          const raw = await fetchReadmeRaw(USER, repo.name, branch);
          if (raw) {
            const first = raw.split('\n').find(l => l.trim().length > 20);
            if (first) {
              node.querySelector('.project-desc').textContent = first.trim().slice(0, 220) + (first.length>220?'…':'');
            }
          }
        } catch (err) {
          // ignore
        }
      })();

      // readme link (open raw)
      readmeLink.href = `https://github.com/${USER}/${repo.name}#readme`;

      projectsGrid.appendChild(node);
    }

    // set cloud infra snapshot data (heuristic)
    cloudRegions.textContent = regions.size ? Array.from(regions).slice(0,3).join(', ') : 'Public clouds indicated by project topics: —';
    cloudContainers.textContent = containers ? `${containers} projects mention containers` : 'No container projects flagged';
    cloudServices.textContent = services ? `${services} cloud integrations` : 'No explicit cloud services flagged';

    // animate pipeline: pulse when projects loaded
    document.querySelectorAll('.pipeline .stage').forEach((s,i)=>{
      s.animate([{transform:'translateY(0)'},{transform:'translateY(-6px)'},{transform:'translateY(0)'}],{delay: i*120, duration: 900, iterations:2, easing:'ease-in-out'});
    });

  } catch (err) {
    console.error('Error fetching projects', err);
    projectsEmpty.textContent = 'Failed to load projects — check the console for details (you may be rate-limited by GitHub).';
  }
}

btnRefresh.addEventListener('click', (e)=>{
  e.preventDefault();
  fetchProjects();
  fetchUser();
});

// initial load
fetchUser();
fetchProjects();

// small progressive enhancement: keyboard shortcut "r" to refresh
window.addEventListener('keydown', (e)=>{
  if (e.key.toLowerCase() === 'r') {
    fetchUser(); fetchProjects();
  }
});
