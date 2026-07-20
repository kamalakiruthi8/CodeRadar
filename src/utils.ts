import { GitHubProfile, LanguageStat, HeatmapDay, CommitDetail, PrDetail, OrgDetail, LanguageDetail, RepoDetail } from "./types";

// Helper for deterministic pseudo-random numbers based on a string seed
export function getSeededRandom(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let seed = Math.abs(hash) || 123456789;
  return () => {
    // Simple LCG (Linear Congruential Generator)
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Preset profiles for instant high-fidelity loading and demoing
export const PRESET_PROFILES: Record<string, Partial<GitHubProfile>> = {
  torvalds: {
    username: "torvalds",
    name: "Linus Torvalds",
    avatarUrl: "https://avatars.githubusercontent.com/u/1024?v=4",
    bio: "Creator of Linux and Git. Veteran kernel developer and software architect.",
    followers: 215000,
    following: 0,
    publicRepos: 7,
    location: "Portland, OR",
    company: "Linux Foundation",
    createdAt: "1998-09-03T00:00:00Z",
    commitsCount: 1250000,
    prsCount: 95000,
    orgsCount: 4,
    languagesCount: 8,
    languages: [
      { name: "C", percentage: 82, color: "#555555" },
      { name: "C++", percentage: 11, color: "#f34b7d" },
      { name: "Assembly", percentage: 4, color: "#6E4C13" },
      { name: "Shell", percentage: 3, color: "#89e051" }
    ]
  },
  gaearon: {
    username: "gaearon",
    name: "Dan Abramov",
    avatarUrl: "https://avatars.githubusercontent.com/u/810438?v=4",
    bio: "React core team alumnus. Co-author of Redux, Create React App, and React Hot Loader.",
    followers: 89000,
    following: 12,
    publicRepos: 268,
    location: "London, UK",
    company: "Software Engineer",
    createdAt: "2011-05-25T00:00:00Z",
    commitsCount: 38200,
    prsCount: 4800,
    orgsCount: 12,
    languagesCount: 16,
    languages: [
      { name: "JavaScript", percentage: 58, color: "#f1e05a" },
      { name: "TypeScript", percentage: 32, color: "#3178c6" },
      { name: "HTML", percentage: 6, color: "#e34c26" },
      { name: "CSS", percentage: 4, color: "#563d7c" }
    ]
  },
  sindresorhus: {
    username: "sindresorhus",
    name: "Sindre Sorhus",
    avatarUrl: "https://avatars.githubusercontent.com/u/170270?v=4",
    bio: "Full-time open-sourcerer. Creator of 1000+ npm packages and modular CLI utilities.",
    followers: 54000,
    following: 58,
    publicRepos: 1245,
    location: "Norway",
    company: "Sindre Sorhus LLC",
    createdAt: "2010-01-14T00:00:00Z",
    commitsCount: 450000,
    prsCount: 68000,
    orgsCount: 45,
    languagesCount: 32,
    languages: [
      { name: "JavaScript", percentage: 42, color: "#f1e05a" },
      { name: "TypeScript", percentage: 40, color: "#3178c6" },
      { name: "Swift", percentage: 12, color: "#f05138" },
      { name: "HTML/CSS", percentage: 6, color: "#e34c26" }
    ]
  },
  tj: {
    username: "tj",
    name: "TJ Holowaychuk",
    avatarUrl: "https://avatars.githubusercontent.com/u/25254?v=4",
    bio: "Co-creator of Express, Koa, Commander, Apex, and other highly popular backend toolkits.",
    followers: 49000,
    following: 1,
    publicRepos: 312,
    location: "Victoria, BC, Canada",
    company: "Apex Design Studio",
    createdAt: "2008-09-18T00:00:00Z",
    commitsCount: 112000,
    prsCount: 16400,
    orgsCount: 18,
    languagesCount: 14,
    languages: [
      { name: "Go", percentage: 52, color: "#00ADD8" },
      { name: "JavaScript", percentage: 31, color: "#f1e05a" },
      { name: "TypeScript", percentage: 12, color: "#3178c6" },
      { name: "CSS", percentage: 5, color: "#563d7c" }
    ]
  }
};

// Colors associated with programming languages
const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  C: "#555555",
  "C++": "#f34b7d",
  Go: "#00add8",
  Python: "#3572a5",
  Rust: "#dea584",
  Java: "#b07219",
  Ruby: "#701516",
  PHP: "#4f5d95",
  Swift: "#f05138",
  Shell: "#89e051"
};

// Generates simulated stats deterministically based on seed
export function generateDeterministicStats(username: string, baseProfile: Partial<GitHubProfile>): GitHubProfile {
  const rand = getSeededRandom(username);
  
  // Calculate simulated numbers proportional to public repos, followers
  const repos = baseProfile.publicRepos || Math.floor(rand() * 80) + 10;
  const followers = baseProfile.followers || Math.floor(rand() * 1200) + 50;
  
  const commitsCount = baseProfile.commitsCount !== undefined ? baseProfile.commitsCount : Math.floor(repos * (rand() * 200 + 100)) + Math.floor(followers * 5);
  const prsCount = baseProfile.prsCount !== undefined ? baseProfile.prsCount : Math.floor(commitsCount * (0.05 + rand() * 0.1));
  const orgsCount = baseProfile.orgsCount !== undefined ? baseProfile.orgsCount : Math.max(1, Math.floor(rand() * 8) + (followers > 5000 ? Math.floor(followers / 2000) : 0));
  
  // Create 5x5 grid for 3D contribution cube
  const cubeGrid: number[][] = [];
  for (let i = 0; i < 5; i++) {
    const row: number[] = [];
    for (let j = 0; j < 5; j++) {
      // Create interesting valleys and peaks
      const baseHeight = rand() * 4.5;
      const intensity = Math.sin((i / 4) * Math.PI) * Math.sin((j / 4) * Math.PI);
      row.push(Math.round((baseHeight * 0.7 + intensity * 1.5) * 10) / 10);
    }
    cubeGrid.push(row);
  }

  // Create contribution heatmap grid (3 rows [Mon, Wed, Fri] x 24 columns)
  const heatmapData: HeatmapDay[] = [];
  const daysOfWeek = ["Mon", "Wed", "Fri"];
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 24; c++) {
      const monthIdx = Math.floor(c / 2);
      const levelRand = rand();
      let level = 0;
      if (levelRand > 0.85) level = 4;
      else if (levelRand > 0.65) level = 3;
      else if (levelRand > 0.4) level = 2;
      else if (levelRand > 0.15) level = 1;
      
      const count = level === 0 ? 0 : Math.floor(level * (rand() * 4 + 2));
      const date = `2026-${String(monthIdx + 1).padStart(2, '0')}-${String(c * 1 + r * 3 + 1).padStart(2, '0')}`;
      
      heatmapData.push({
        date,
        count,
        level,
        dayName: daysOfWeek[r],
        monthName: months[monthIdx]
      });
    }
  }

  // Default languages if not set
  const languages: LanguageStat[] = baseProfile.languages || [
    { name: "TypeScript", percentage: 45, color: "#3178c6" },
    { name: "JavaScript", percentage: 35, color: "#f1e05a" },
    { name: "CSS", percentage: 12, color: "#563d7c" },
    { name: "HTML", percentage: 8, color: "#e34c26" }
  ];

  // Generate realistic commit history (8 entries, sorted new to old)
  const commitsList: CommitDetail[] = [];
  const commitMessages = [
    "Refactor state management core architecture",
    "Optimize voxel cube heights and 3D rendering layout",
    "Fix memory leak on active terminal heatmap cells",
    "Initialize dashboard metrics telemetry feeds",
    "Integrate high-contrast accessibility toggles",
    "Streamline telemetry network handshake protocol",
    "Clean stale layout files and sync TypeScript models",
    "Deploy modular drill-down lists for live commits"
  ];
  const realRepos = baseProfile.reposList && baseProfile.reposList.length > 0
    ? baseProfile.reposList.map(r => r.name)
    : [];
  const reposListForUser = realRepos.length > 0 ? realRepos : [
    "cyber-radar",
    "quantum-nodes",
    "voxel-cube",
    "reactive-heatmap"
  ];
  for (let i = 0; i < 8; i++) {
    const sha = Array.from({ length: 7 }, () => "0123456789abcdef"[Math.floor(rand() * 16)]).join("");
    const message = commitMessages[i % commitMessages.length];
    const repo = reposListForUser[Math.floor(rand() * reposListForUser.length)];
    const date = new Date(Date.now() - i * 1.5 * 24 * 60 * 60 * 1000 - Math.floor(rand() * 12) * 60 * 60 * 1000).toISOString();
    commitsList.push({
      sha,
      message,
      repoName: repo.includes("/") ? repo : `${username}/${repo}`,
      date,
      url: `https://github.com/${repo.includes("/") ? repo : `${username}/${repo}`}/commit/${sha}`
    });
  }

  // Generate PR history (5 entries, sorted new to old)
  const prsList: PrDetail[] = [];
  const prTitles = [
    "feat: add real-time interactive terminal views (#48)",
    "perf: reduce virtual matrix memory overhead by 40% (#35)",
    "fix: resolve tooltip race condition in webkit container (#24)",
    "refactor: restructure component lifecycle flow (#19)",
    "docs: update API telemetry and architectural design specs (#12)"
  ];
  for (let i = 0; i < prTitles.length; i++) {
    const id = Math.floor(rand() * 200) + 10;
    const title = prTitles[i];
    const repo = reposListForUser[Math.floor(rand() * reposListForUser.length)];
    const date = new Date(Date.now() - (i * 3 + 1) * 24 * 60 * 60 * 1000 - Math.floor(rand() * 12) * 60 * 60 * 1000).toISOString();
    prsList.push({
      id,
      title,
      repoName: repo.includes("/") ? repo : `${username}/${repo}`,
      date,
      url: `https://github.com/${repo.includes("/") ? repo : `${username}/${repo}`}/pull/${id}`,
      state: "merged"
    });
  }

  // Generate Orgs list (deterministic up to orgsCount, max 5)
  const orgsList: OrgDetail[] = [];
  const orgNames = [
    `${username.charAt(0).toUpperCase() + username.slice(1)} Labs`,
    "Aether Open Source",
    "Quantum Foundation",
    "Neon Developer Guild",
    "Cyber Security Nexus"
  ];
  const countOfOrgs = orgsCount > 0 ? orgsCount : 2;
  const orgCountToGen = Math.min(orgNames.length, countOfOrgs);
  for (let i = 0; i < orgCountToGen; i++) {
    const name = orgNames[i];
    const slug = name.toLowerCase().replace(/ /g, "-");
    orgsList.push({
      name,
      description: `Exploring open-source collaboration in ${name.split(" ")[0]} ecosystems.`,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      url: `https://github.com/${slug}`
    });
  }

  // Generate languages details
  const languagesList: LanguageDetail[] = languages.map((lang) => {
    const repoCount = Math.floor(repos * (lang.percentage / 100)) + 1;
    const totalBytes = Math.floor(lang.percentage * (rand() * 100000 + 40000)) + 10000;
    return {
      name: lang.name,
      percentage: lang.percentage,
      color: lang.color,
      repoCount,
      totalBytes
    };
  });

  // Generate deterministic repos list for constellation visualization
  const generatedReposList: RepoDetail[] = [];
  const presetReposList = [
    "quantum-radar",
    "cybernet-core",
    "voxel-viz-3d",
    "matrix-terminal",
    "reactive-handshake",
    "starlight-constellation",
    "hydra-network",
    "cosmic-sync"
  ];
  const reposCountToGen = Math.min(presetReposList.length, repos);
  for (let i = 0; i < Math.max(4, Math.min(8, reposCountToGen)); i++) {
    const repoName = presetReposList[i % presetReposList.length];
    const itemRand = getSeededRandom(repoName + username);
    generatedReposList.push({
      name: repoName,
      description: `State-of-the-art open-source project ${repoName} built for high-performance scale.`,
      stars: Math.floor(itemRand() * 250) + 12,
      forks: Math.floor(itemRand() * 80) + 2,
      language: languages[i % languages.length].name,
      url: `https://github.com/${username}/${repoName}`,
      contributionsCount: Math.floor(itemRand() * 120) + 15
    });
  }

  return {
    username: baseProfile.username || username,
    name: baseProfile.name || username.charAt(0).toUpperCase() + username.slice(1),
    avatarUrl: baseProfile.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
    bio: baseProfile.bio || `Developer exploring the digital frontier. Active contributor on GitHub since ${new Date(baseProfile.createdAt || '2019-01-01').getFullYear()}.`,
    followers,
    following: baseProfile.following || Math.floor(rand() * 200) + 10,
    publicRepos: repos,
    location: baseProfile.location || "Matrix Virtual Space",
    company: baseProfile.company || "Independent Hacker",
    createdAt: baseProfile.createdAt || "2019-01-01T00:00:00Z",
    commitsCount,
    prsCount,
    orgsCount,
    languagesCount: baseProfile.languagesCount || languages.length + Math.floor(rand() * 5),
    languages,
    cubeGrid,
    heatmapData,
    commitsList: (baseProfile.commitsList && baseProfile.commitsList.length > 0) ? baseProfile.commitsList : commitsList,
    prsList: (baseProfile.prsList && baseProfile.prsList.length > 0) ? baseProfile.prsList : prsList,
    orgsList: (baseProfile.orgsList && baseProfile.orgsList.length > 0) ? baseProfile.orgsList : orgsList,
    languagesList: baseProfile.languagesList && baseProfile.languagesList.length > 0 ? baseProfile.languagesList : languagesList,
    reposList: baseProfile.isRealProfile ? (baseProfile.reposList || []) : (baseProfile.reposList && baseProfile.reposList.length > 0 ? baseProfile.reposList : generatedReposList),
    isRealProfile: baseProfile.isRealProfile || false
  };
}

// Main API interface
export async function fetchGitHubProfile(username: string): Promise<GitHubProfile> {
  const normalized = username.toLowerCase().trim();
  
  // Check if it matches a preset instantly
  const preset = PRESET_PROFILES[normalized];
  
  try {
    const userRes = await fetch(`https://api.github.com/users/${normalized}`);
    if (!userRes.ok) {
      // A real GitHub 404 means the username genuinely doesn't exist — surface a real error
      // instead of fabricating a fake profile, unless it's one of our known presets.
      if (userRes.status === 404) {
        if (preset) {
          return generateDeterministicStats(normalized, preset);
        }
        throw new Error("USER_NOT_FOUND");
      }
      // Other failures (rate limiting, GitHub outage, etc.) — fall back to a generated
      // profile only for known presets; otherwise treat it as a network/API error.
      if (preset) {
        return generateDeterministicStats(normalized, preset);
      }
      throw new Error("API_ERROR");
    }
    
    const userData = await userRes.json();
    
    // Attempt to fetch repositories to extract language stats
    let languages: LanguageStat[] = [];
    let languagesCount = 0;
    let parsedReposList: RepoDetail[] = [];
    try {
      const reposRes = await fetch(`https://api.github.com/users/${normalized}/repos?sort=updated&per_page=40`);
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        
        // Map actual repos list
        parsedReposList = reposData.slice(0, 15).map((repo: any) => ({
          name: repo.name,
          description: repo.description || "Public repository hosted on GitHub.",
          stars: repo.stargazers_count || 0,
          forks: repo.forks_count || 0,
          language: repo.language || "TypeScript",
          url: repo.html_url,
          contributionsCount: Math.floor(getSeededRandom(repo.name)() * 120) + 15
        }));

        // Count language occurrences
        const counts: Record<string, number> = {};
        let total = 0;
        
        reposData.forEach((repo: any) => {
          if (repo.language) {
            counts[repo.language] = (counts[repo.language] || 0) + 1;
            total++;
          }
        });
        
        const sortedLangs = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        languagesCount = sortedLangs.length;
        
        languages = sortedLangs.slice(0, 4).map(([name, count]) => {
          const percentage = Math.round((count / total) * 100);
          return {
            name,
            percentage,
            color: LANGUAGE_COLORS[name] || "#888888"
          };
        });
        
        // Distribute remaining percentages so it sums to 100%
        const sum = languages.reduce((acc, l) => acc + l.percentage, 0);
        if (languages.length > 0 && sum < 100) {
          languages[0].percentage += (100 - sum);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch languages, using fallbacks", e);
    }
    
    // Fetch real organizations if possible
    let orgsList: OrgDetail[] = [];
    try {
      const orgsRes = await fetch(`https://api.github.com/users/${normalized}/orgs`);
      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        orgsList = orgsData.map((o: any) => ({
          name: o.login,
          description: o.description || "Public organization node on GitHub.",
          avatarUrl: o.avatar_url,
          url: `https://github.com/${o.login}`
        }));
      }
    } catch (e) {
      console.warn("Failed to fetch organizations", e);
    }

    // Fetch commits and PRs using search API for deep historical accuracy
    let commitsList: CommitDetail[] = [];
    let prsList: PrDetail[] = [];
    let realCommitsCount = 0;
    let realPrsCount = 0;

    // 1. Try to search commits
    try {
      const commitSearchRes = await fetch(`https://api.github.com/search/commits?q=author:${normalized}&sort=committer-date&order=desc&per_page=15`, {
        headers: { Accept: "application/vnd.github+json" }
      });
      if (commitSearchRes.ok) {
        const commitSearchData = await commitSearchRes.json();
        if (commitSearchData && commitSearchData.items) {
          realCommitsCount = commitSearchData.total_count || 0;
          commitSearchData.items.forEach((item: any) => {
            commitsList.push({
              sha: item.sha.substring(0, 7),
              message: item.commit.message,
              repoName: item.repository?.full_name || "Unknown Repository",
              date: item.commit.author?.date || new Date().toISOString(),
              url: item.html_url
            });
          });
        }
      }
    } catch (e) {
      console.warn("Failed to search commits", e);
    }

    // 2. Try to search PRs
    try {
      const prSearchRes = await fetch(`https://api.github.com/search/issues?q=author:${normalized}+type:pr&sort=created&order=desc&per_page=15`);
      if (prSearchRes.ok) {
        const prSearchData = await prSearchRes.json();
        if (prSearchData && prSearchData.items) {
          realPrsCount = prSearchData.total_count || 0;
          prSearchData.items.forEach((item: any) => {
            const parts = item.html_url.split("/");
            const repoName = `${parts[3]}/${parts[4]}`;
            const isMerged = item.pull_request?.merged_at || item.state === "closed";
            prsList.push({
              id: item.number,
              title: item.title,
              repoName,
              date: item.closed_at || item.created_at,
              url: item.html_url,
              state: isMerged ? "merged" : "closed"
            });
          });
        }
      }
    } catch (e) {
      console.warn("Failed to search PRs", e);
    }

    // 3. Fallback to public events if search is rate limited or returned empty
    if (commitsList.length === 0 || prsList.length === 0) {
      try {
        const eventsRes = await fetch(`https://api.github.com/users/${normalized}/events?per_page=100`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          
          eventsData.forEach((evt: any) => {
            if (evt.type === "PushEvent" && evt.payload?.commits && commitsList.length === 0) {
              evt.payload.commits.forEach((c: any) => {
                if (commitsList.length < 15) {
                  commitsList.push({
                    sha: c.sha.substring(0, 7),
                    message: c.message,
                    repoName: evt.repo.name,
                    date: evt.created_at,
                    url: `https://github.com/${evt.repo.name}/commit/${c.sha}`
                  });
                }
              });
            }
            
            if (evt.type === "PullRequestEvent" && evt.payload?.pull_request && prsList.length === 0) {
              const pr = evt.payload.pull_request;
              if (prsList.length < 10) {
                const isDuplicate = prsList.some(p => p.id === pr.number);
                if (!isDuplicate) {
                  prsList.push({
                    id: pr.number,
                    title: pr.title,
                    repoName: evt.repo.name,
                    date: pr.merged_at || pr.closed_at || pr.created_at,
                    url: pr.html_url,
                    state: pr.merged ? "merged" : "closed"
                  });
                }
              }
            }
          });
          
          if (realCommitsCount === 0) realCommitsCount = commitsList.length;
          if (realPrsCount === 0) realPrsCount = prsList.length;
        }
      } catch (e) {
        console.warn("Failed to fetch events fallback", e);
      }
    }

    // Standard profile object built from actual live details
    const liveProfile: Partial<GitHubProfile> = {
      username: userData.login,
      name: userData.name || userData.login,
      avatarUrl: userData.avatar_url,
      bio: userData.bio,
      followers: userData.followers,
      following: userData.following,
      publicRepos: userData.public_repos,
      location: userData.location,
      company: userData.company,
      createdAt: userData.created_at,
      languages: languages,
      languagesCount: languagesCount,
      commitsList: commitsList,
      prsList: prsList,
      orgsList: orgsList,
      reposList: parsedReposList,
      commitsCount: realCommitsCount,
      prsCount: realPrsCount,
      orgsCount: orgsList.length,
      isRealProfile: true
    };
    
    return generateDeterministicStats(normalized, liveProfile);
    
  } catch (err: any) {
    // Let our explicit errors propagate so the UI can show a real "not found" / error message
    if (err.message === "USER_NOT_FOUND" || err.message === "API_ERROR") {
      throw err;
    }
    console.warn("GitHub API rate limit or error, using deterministic generator for", username, err);
    // Unexpected failures (network drop, JSON parse issue, etc.) — fall back to simulated
    // data only for known presets; otherwise surface it as an error too.
    if (preset) {
      return generateDeterministicStats(normalized, preset);
    }
    throw new Error("API_ERROR");
  }
}
