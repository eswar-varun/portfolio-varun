// All site content lives here. Edit this file to update the portfolio —
// components only read from it.

export const profile = {
  name: 'Eswar Varun S',
  shortName: 'Eswar Varun',
  initials: 'EV',
  role: 'Software Engineer',
  location: 'Chennai, India',
  status: 'Open to SDE roles',
  email: 's.eswarvarun@gmail.com',
  githubUser: 'eswar-varun',
  // Repos left out of the live GitHub section and language stats.
  hiddenRepos: ['portfolio-varun'],
  links: {
    github: 'https://github.com/eswar-varun',
    linkedin: 'https://www.linkedin.com/in/eswar-varun-s',
    resume: '/resume.pdf',
  },
  // Set this after you push the site's own code, e.g.
  // 'https://github.com/eswar-varun/portfolio'. The footer links to it.
  sourceRepo: null as string | null,

  headline: 'I build backend services and AI tooling that take manual work off engineering teams.',
  intro:
    "Software engineer at Accenture, building Python and FastAPI services on Azure that automate cloud migrations and surface cross-team delivery risk. Previously reviewed LLM-generated code for Scale AI's model training. I like systems that are tested, observable, and boring to operate.",
};

export const highlights = [
  { value: '~80%', label: 'less manual effort in cloud-migration workflows' },
  { value: '100+', label: 'concurrent work items tracked for dependency risk' },
  { value: '1,000+', label: 'documentation pages indexed for retrieval' },
  { value: '<200 ms', label: 'latency for real-time sign-language recognition' },
];

export type Project = {
  title: string;
  kind: string; // e.g. "Accenture · internal" or "Personal"
  summary: string;
  flow: string[]; // pipeline stages, rendered as a diagram
  points: string[];
  metrics: string[];
  stack: string[];
  repo?: string; // GitHub repo name under githubUser — enables live stats
  demo?: string;
  privateNote?: string;
};

export const projects: Project[] = [
  {
    title: 'Dependency Tracker',
    kind: 'Accenture · internal',
    summary:
      'Finds cross-team dependencies hidden in Azure DevOps and flags deliverables that are about to slip — before the standup where it becomes a problem.',
    flow: ['Azure DevOps API', 'WIQL ingest', 'Dependency graph', 'Risk scoring', 'Escalation router'],
    points: [
      'Queries work items with WIQL and walks link relations to build a dependency graph across teams.',
      'Scores each deliverable for risk and routes escalations to the right forum: team standup, ART sync, or FED.',
      'Change detection with content hashes and timestamps, so each run only reprocesses what changed.',
    ],
    metrics: ['100+ concurrent work items', 'Used across a scaled Agile program'],
    stack: ['Python', 'FastAPI', 'Azure DevOps REST', 'LangChain', 'RAG', 'Graph API'],
    privateNote: 'Internal project, so the code is private.',
  },
  {
    title: 'Cloud Migration Automation',
    kind: 'Accenture · internal',
    summary:
      'Automates the slow, manual parts of moving applications from AWS and GCP to Azure: finding every SDK call and working out what replaces it.',
    flow: ['Repo scan', 'SDK dependency map', 'Doc retrieval (RAG)', 'Azure equivalents', 'Validation'],
    points: [
      'Static scanner maps 100+ AWS/GCP SDK dependencies in a repository to their Azure equivalents.',
      'Retrieval over 1,000+ pages of cloud documentation grounds each suggested replacement.',
      'Shipped with automated tests, CI/CD on Azure DevOps, structured logging, and alerting.',
    ],
    metrics: ['~80% less manual effort', '100+ SDK dependencies mapped', '1,000+ doc pages indexed'],
    stack: ['Python', 'FastAPI', 'LangChain', 'RAG', 'Azure', 'AWS', 'GCP'],
    privateNote: 'Internal project, so the code is private.',
  },
  {
    title: 'Real-Time Sign Language Translator',
    kind: 'Personal',
    summary:
      'Translates ASL and ISL gestures from a webcam into text in real time, then into other spoken languages.',
    flow: ['Webcam', 'MediaPipe landmarks', 'BiLSTM classifier', 'Text', 'Translate API'],
    points: [
      'Extracts hand landmarks with MediaPipe and OpenCV instead of raw pixels, which keeps the model small and fast.',
      'BiLSTM sequence classifier trained on 5,000+ gesture samples.',
    ],
    metrics: ['92% test accuracy', '<200 ms per prediction', '5,000+ training samples'],
    stack: ['Python', 'TensorFlow', 'OpenCV', 'MediaPipe'],
    // TODO: push this project to GitHub and set repo: '<repo-name>'.
  },
  {
    title: 'CodeXchange',
    kind: 'Personal',
    summary: 'LLM-powered code translator that converts programs between 10+ languages.',
    flow: ['Source code', 'Prompt templates', 'Vertex AI', 'Translated code'],
    points: [
      'Prompt engineering on Vertex AI cut translation errors by ~30%.',
      'Shipped as a Streamlit web app.',
    ],
    metrics: ['10+ languages', '~30% fewer translation errors'],
    stack: ['Python', 'Vertex AI', 'Streamlit'],
    repo: 'CodeXchange',
  },
];

export const otherProjects = [
  {
    title: "Parkinson's Disease Prediction",
    summary: 'XGBoost model on 20+ vocal biomarkers; 94% accuracy, ROC-AUC validated.',
    stack: ['Python', 'XGBoost', 'scikit-learn'],
    repo: 'parkinsons-using-xgboost',
  },
];

export const experience = [
  {
    role: 'Advanced Application Engineering Analyst',
    company: 'Accenture',
    period: 'Oct 2025 — Present',
    location: 'Chennai, India',
    points: [
      'Built a dependency-tracking service over Azure DevOps REST APIs (WIQL, link-relation traversal) that maps cross-team dependencies across 100+ concurrent work items, scores at-risk deliverables, and routes escalations.',
      'Automated a multi-stage cloud-migration workflow: a static scanner maps 100+ AWS/GCP SDK dependencies to Azure equivalents, backed by retrieval over 1,000+ documentation pages, cutting manual effort by ~80%.',
      'Shipped every service with automated tests, CI/CD on Azure DevOps, structured logging, telemetry, and alerting.',
    ],
    stack: ['Python', 'FastAPI', 'Flask', 'Azure', 'Azure DevOps', 'LangChain'],
  },
  {
    role: 'AI Code Reviewer (Contract)',
    company: 'Outlier (Scale AI)',
    period: 'Dec 2024 — Jun 2025',
    location: 'Remote',
    points: [
      'Reviewed LLM-generated solutions to algorithmic and software-engineering problems for correctness, time and space complexity, and edge cases.',
      'Wrote reference solutions and grading feedback used in SFT and RLHF training pipelines.',
    ],
    stack: ['Python', 'Java'],
  },
];

export const education = {
  school: 'Vellore Institute of Technology, Chennai',
  degree: 'B.Tech, Electronics and Computer Engineering',
  period: '2021 — 2025',
  detail: 'CGPA 8.53 / 10',
  certs: ['AWS Certified Cloud Practitioner (2024)'],
};

export const skills = [
  { group: 'Languages', items: ['Java', 'Python', 'C', 'C#', 'SQL', 'JavaScript'] },
  { group: 'Backend', items: ['FastAPI', 'Flask', 'REST APIs', 'Microservices', 'Event-driven design'] },
  { group: 'Cloud & DevOps', items: ['Azure', 'AWS', 'GCP', 'Docker', 'Azure DevOps CI/CD', 'Git'] },
  { group: 'Data', items: ['MySQL', 'MongoDB'] },
  { group: 'AI / ML', items: ['LangChain', 'RAG', 'PyTorch', 'TensorFlow', 'XGBoost', 'OpenCV'] },
];
