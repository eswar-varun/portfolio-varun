// All site content lives here. Edit this file to update the portfolio;
// the editor UI only reads from it.

export const profile = {
  name: 'Eswar Varun S',
  shortName: 'Eswar Varun',
  handle: 'eswar-varun',
  role: 'Software Engineer',
  company: 'Accenture',
  location: 'Chennai, India',
  status: 'Open to SDE roles',
  email: 's.eswarvarun@gmail.com',
  githubUser: 'eswar-varun',
  // Repos left out of the live GitHub section and language stats.
  hiddenRepos: [] as string[],
  links: {
    github: 'https://github.com/eswar-varun',
    linkedin: 'https://www.linkedin.com/in/eswar-varun-s',
    resume: '/resume.pdf',
  },
  // This site's own code.
  sourceRepo: 'https://github.com/eswar-varun/portfolio-varun' as string | null,

  headline: 'I build backend services and AI tools that take manual work off engineering teams.',
  intro:
    'Software engineer at Accenture. I build Python and FastAPI services on Azure: one automates cloud migrations, another tracks dependencies across 100+ work items in a large Agile program. Before Accenture I reviewed LLM-generated code for Scale AI.',
};

export type Project = {
  slug: string; // used for file names and anchors
  title: string;
  kind: string; // e.g. "Accenture, internal" or "Personal"
  year: string;
  summary: string;
  flow: string[]; // pipeline stages
  points: string[];
  metrics: string[];
  stack: string[];
  repo?: string; // repo name under githubUser, enables a code link
  demo?: string;
  private?: boolean;
};

export const projects: Project[] = [
  {
    slug: 'dependency-tracker',
    title: 'Dependency Tracker',
    kind: 'Accenture, internal',
    year: '2025',
    summary:
      'Finds cross-team dependencies in Azure DevOps and flags deliverables that are about to slip, so they get raised before the standup instead of during it.',
    flow: ['Azure DevOps API', 'WIQL ingest', 'Dependency graph', 'Risk scoring', 'Escalation router'],
    points: [
      'Queries work items with WIQL and follows link relations to build a dependency graph across teams.',
      'Scores each deliverable for risk and sends escalations to the right forum: team standup, ART sync or FED.',
      'Change detection with content hashes and timestamps, so each run only reprocesses what changed.',
    ],
    metrics: ['100+ concurrent work items', 'Used across a scaled Agile program'],
    stack: ['Python', 'FastAPI', 'Azure DevOps REST', 'LangChain', 'RAG', 'Graph API'],
    private: true,
  },
  {
    slug: 'cloud-migration',
    title: 'Cloud Migration Automation',
    kind: 'Accenture, internal',
    year: '2025',
    summary:
      'Automates the slow part of moving apps from AWS and GCP to Azure: finding every SDK call in a codebase and working out what replaces it.',
    flow: ['Repo scan', 'SDK dependency map', 'Doc retrieval', 'Azure equivalents', 'Validation'],
    points: [
      'Static scanner maps 100+ AWS and GCP SDK dependencies in a repo to their Azure equivalents.',
      'Retrieval over 1,000+ pages of cloud docs backs up each suggested replacement.',
      'Shipped with automated tests, CI/CD on Azure DevOps, structured logging and alerting.',
    ],
    metrics: ['80% less manual effort', '100+ SDK dependencies mapped', '1,000+ doc pages indexed'],
    stack: ['Python', 'FastAPI', 'LangChain', 'RAG', 'Azure', 'AWS', 'GCP'],
    private: true,
  },
  {
    slug: 'llm-gateway',
    title: 'LLM Inference Gateway',
    kind: 'Personal',
    year: '2026',
    summary:
      'An OpenAI-compatible gateway between apps and LLM providers: one place for routing, failure handling and observability, with no client changes.',
    flow: ['OpenAI SDK client', 'Route by model alias', 'Stream relay', 'Azure OpenAI · Ollama · vLLM'],
    points: [
      "Streams commit to HTTP 200 only after the upstream's first token, so upstream failures get real status codes instead of a broken stream.",
      'A client hanging up cancels the upstream request, so nobody pays for tokens that will never be read.',
      'Every failure is classified once (timeout, rate limit, upstream 5xx, misconfiguration), and that decides the status code and whether a retry can help.',
      '46 tests across three layers: scripted fault injection, in-process contract tests, and real-socket integration tests.',
    ],
    metrics: ['~230 ms to stop upstream generation after a hang-up', '46 tests', 'Milestone 1 of 5'],
    stack: ['Python', 'FastAPI', 'asyncio', 'httpx', 'pytest', 'GitHub Actions'],
    repo: 'llm-inference-gateway',
  },
  {
    slug: 'flakehunter',
    title: 'FlakeHunter',
    kind: 'Personal',
    year: '2026',
    summary: 'Finds, ranks and triages flaky tests from the JUnit XML that any CI already produces.',
    flow: ['JUnit XML', 'Safe parse', 'Run history', 'Classify', 'Rank'],
    points: [
      'A test that passes and fails on the same commit is flaky. One that fails every attempt on the latest commit is broken, never flaky, so real regressions are not waved through.',
      'Ranks by the Wilson-score lower bound, so 1 failure in 2 runs does not outrank 30 in 100.',
      'Measured on a 23-test ground-truth suite of deliberately flaky and broken tests, re-checked in CI on every push.',
      'Idempotent, shard-safe ingestion that rejects hostile XML (entity expansion, XXE).',
    ],
    metrics: ['100% precision on the ground-truth suite', '83% recall after 20 runs', '48 tests'],
    stack: ['Python', 'pytest', 'SQLite', 'defusedxml', 'GitHub Actions'],
    repo: 'flakehunter',
  },
  {
    slug: 'sign-language',
    title: 'Sign Language Translator',
    kind: 'Personal',
    year: '2024',
    summary: 'Reads ASL and ISL gestures from a webcam, turns them into text in real time, and translates the text into other languages.',
    flow: ['Webcam', 'MediaPipe landmarks', 'BiLSTM classifier', 'Text', 'Translate API'],
    points: [
      'Uses MediaPipe hand landmarks instead of raw pixels, which keeps the model small and fast.',
      'BiLSTM sequence classifier trained on 5,000+ gesture samples.',
    ],
    metrics: ['92% test accuracy', '<200ms per prediction', '5,000+ training samples'],
    stack: ['Python', 'TensorFlow', 'OpenCV', 'MediaPipe'],
    // TODO: push this project to GitHub and set repo: '<repo-name>'.
  },
  {
    slug: 'codexchange',
    title: 'CodeXchange',
    kind: 'Personal',
    year: '2024–26',
    summary:
      'Translates code between 12 programming languages with Gemini, and checks the translations by running them.',
    flow: ['Source code', 'Gemini API', 'Code extraction', 'Run in target runtime', 'Compare with test cases'],
    points: [
      'Rebuilt on the Gemini API after Google retired PaLM, and fixed output parsing that leaked language tags into translated code.',
      "Execution-based evaluation: 12 tasks built around cross-language traps (negative modulo, banker's rounding, JavaScript's string sort) run the translated code in Python or Node.",
      "Model-generated code runs under Node's permission model, with no file writes or child processes, and a timeout.",
    ],
    metrics: ['12 languages', '12 trap tasks, executed', '42 tests in CI'],
    stack: ['Python', 'Gemini API', 'Streamlit', 'Node.js'],
    repo: 'CodeXchange',
  },
];

export const otherProjects = [
  {
    slug: 'parkinsons',
    title: "Parkinson's Detection: Evaluation Audit",
    summary:
      'My XGBoost model scored 94.9%, but every test-set speaker was also in training. Holding out whole people: 79.1% accuracy, ROC-AUC 0.75.',
    stack: ['Python', 'XGBoost', 'scikit-learn', 'pandas'],
    repo: 'parkinsons-using-xgboost',
  },
];

export const experience = [
  {
    role: 'Advanced Application Engineering Analyst',
    company: 'Accenture',
    period: 'Oct 2025 – Present',
    location: 'Chennai, India',
    points: [
      'Built a dependency-tracking service on Azure DevOps REST APIs (WIQL, link-relation traversal) that maps cross-team dependencies across 100+ concurrent work items, scores at-risk deliverables and routes escalations.',
      'Automated a multi-stage cloud migration workflow: a static scanner maps 100+ AWS/GCP SDK dependencies to Azure equivalents, backed by retrieval over 1,000+ doc pages. Cut manual effort by about 80%.',
      'Every service ships with automated tests, CI/CD on Azure DevOps, structured logging, telemetry and alerting.',
    ],
    stack: ['Python', 'FastAPI', 'Flask', 'Azure', 'Azure DevOps', 'LangChain'],
  },
  {
    role: 'Freelance Software Engineer',
    company: 'Outlier (Scale AI)',
    period: 'Dec 2024 – Jun 2025',
    location: 'Remote',
    points: [
      'Reviewed LLM-generated solutions to algorithm and software-engineering problems for correctness, time and space complexity, and edge cases.',
      'Wrote reference solutions and grading feedback used in SFT and RLHF training.',
    ],
    stack: ['Python', 'Java'],
  },
];

export const education = {
  school: 'Vellore Institute of Technology, Chennai',
  degree: 'B.Tech, Electronics and Computer Engineering',
  period: '2021 – 2025',
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
