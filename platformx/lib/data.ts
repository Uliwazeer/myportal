// ─── Types ────────────────────────────────────────────────────────────────────

export type Level = "Beginner / Fresh" | "Junior" | "Mid-Level" | "Senior";

export const levels: Level[] = [
  "Beginner / Fresh",
  "Junior",
  "Mid-Level",
  "Senior",
];

export type UserRole = "intern" | "mentor" | "consultation";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  // Intern fields
  university?: string;
  level?: Level;
  trackSlug?: string;
  mentorId?: string;
  github?: string;
  progress?: number;
  // Mentor fields
  title?: string;
  bio?: string;
  skills?: string[];
  tracks?: string[];
  yearsExperience?: number;
  availability?: AvailabilitySlot[];
  consultationPrice?: number;
  // Consultation fields
  topic?: string;
  // Notifications
  notifications?: Notification[];
};

export type AvailabilitySlot = {
  day: string; // e.g. "Monday"
  startTime: string; // "18:00"
  endTime: string; // "22:00"
};

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "upcoming"
  | "in-progress"
  | "completed"
  | "cancelled";

export type Booking = {
  id: string;
  userId: string;
  mentorId: string;
  trackSlug: string;
  date: string; // ISO date string "2026-09-05"
  time: string; // "19:00"
  duration: 40 | 60;
  topic?: string;
  status: BookingStatus;
  createdAt: string;
};

export type Review = {
  id: string;
  bookingId: string;
  userId: string;
  mentorId: string;
  rating: number; // 1–5
  comment: string;
  userName: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
};

// ─── Mentors ──────────────────────────────────────────────────────────────────

export type MentorData = {
  id: string;
  name: string;
  title: string;
  bio: string;
  tracks: string[]; // track slugs
  skills: string[];
  level: Level; // mentor's expertise level
  yearsExperience: number;
  consultationPrice: number; // in EGP
  rating: number;
  reviewCount: number;
  availability: AvailabilitySlot[];
  initials: string;
  color: string; // tailwind accent color class for avatar bg
};

export const mentors: MentorData[] = [
  {
    id: "ali-wazeer",
    name: "Ali Wazeer",
    title: "Senior Platform Engineer",
    bio:
      "10+ years building and running large-scale internal platforms. Specializes in Kubernetes, GitOps, Observability, and Platform Engineering best practices. Led platform teams at multiple startups and enterprises.",
    tracks: ["platform-engineer", "devops-engineer"],
    skills: [
      "Kubernetes",
      "ArgoCD",
      "Helm",
      "Terraform",
      "Prometheus",
      "Grafana",
      "Docker",
      "Linux",
    ],
    level: "Senior",
    yearsExperience: 10,
    consultationPrice: 300,
    rating: 4.9,
    reviewCount: 87,
    availability: [
      { day: "Monday", startTime: "18:00", endTime: "22:00" },
      { day: "Wednesday", startTime: "18:00", endTime: "22:00" },
      { day: "Saturday", startTime: "14:00", endTime: "20:00" },
    ],
    initials: "AW",
    color: "bg-red-600",
  },
  {
    id: "adnan",
    name: "Adnan",
    title: "Senior Backend Engineer",
    bio:
      "Expert in building scalable backend systems, REST & GraphQL APIs, microservices, and distributed systems. Passionate about clean architecture and performance optimization.",
    tracks: ["backend-engineer"],
    skills: [
      "Node.js",
      "Python",
      "PostgreSQL",
      "Redis",
      "Docker",
      "Microservices",
      "GraphQL",
      "AWS",
    ],
    level: "Senior",
    yearsExperience: 8,
    consultationPrice: 250,
    rating: 4.8,
    reviewCount: 64,
    availability: [
      { day: "Tuesday", startTime: "19:00", endTime: "23:00" },
      { day: "Thursday", startTime: "19:00", endTime: "23:00" },
      { day: "Friday", startTime: "16:00", endTime: "22:00" },
    ],
    initials: "AD",
    color: "bg-orange-600",
  },
  {
    id: "yamen",
    name: "Yamen",
    title: "Cyber Security Specialist",
    bio:
      "Certified penetration tester and security researcher. Specializes in web application security, network security, incident response, and cloud security. Speaker at regional security conferences.",
    tracks: ["cyber-security"],
    skills: [
      "Penetration Testing",
      "Burp Suite",
      "Metasploit",
      "SIEM",
      "Forensics",
      "OWASP",
      "Cloud Security",
      "Python",
    ],
    level: "Senior",
    yearsExperience: 7,
    consultationPrice: 280,
    rating: 4.9,
    reviewCount: 52,
    availability: [
      { day: "Monday", startTime: "20:00", endTime: "23:00" },
      { day: "Wednesday", startTime: "20:00", endTime: "23:00" },
      { day: "Saturday", startTime: "10:00", endTime: "16:00" },
    ],
    initials: "YM",
    color: "bg-blue-600",
  },
  {
    id: "sajid",
    name: "Sajid",
    title: "System Administrator",
    bio:
      "Veteran systems administrator with deep expertise in Linux, Windows Server, virtualization, and enterprise IT infrastructure. Helps teams build robust, secure, and maintainable systems.",
    tracks: ["devops-engineer", "platform-engineer"],
    skills: [
      "Linux",
      "Windows Server",
      "VMware",
      "Active Directory",
      "Bash",
      "Ansible",
      "Networking",
      "Storage",
    ],
    level: "Senior",
    yearsExperience: 12,
    consultationPrice: 200,
    rating: 4.7,
    reviewCount: 41,
    availability: [
      { day: "Sunday", startTime: "14:00", endTime: "20:00" },
      { day: "Thursday", startTime: "18:00", endTime: "22:00" },
    ],
    initials: "SJ",
    color: "bg-green-600",
  },
];

// ─── Tracks ───────────────────────────────────────────────────────────────────

export type Module = {
  week: number;
  title: string;
  topics: string[];
};

export type Track = {
  slug: string;
  name: string;
  tagline: string;
  level: Level;
  durationWeeks: number;
  modules: Module[];
  finalProject: string;
};

export const tracks: Track[] = [
  {
    slug: "frontend-engineer",
    name: "Frontend Engineer",
    tagline:
      "Master UI/UX, React, and modern frontend tools to build interactive web apps.",
    level: "Junior",
    durationWeeks: 8,
    modules: [
      {
        week: 1,
        title: "HTML, CSS & Accessibility",
        topics: ["Semantic HTML", "Advanced CSS Flex/Grid", "A11y Basics"],
      },
      {
        week: 2,
        title: "JavaScript Deep Dive",
        topics: ["ES6+ Features", "Async/Await", "DOM Manipulation"],
      },
      {
        week: 3,
        title: "React Fundamentals",
        topics: ["Components & Props", "State & Lifecycle", "Hooks"],
      },
      {
        week: 4,
        title: "Advanced React",
        topics: ["Context API", "Performance Optimization", "Custom Hooks"],
      },
      {
        week: 5,
        title: "Next.js & SSR",
        topics: ["Routing", "Data Fetching", "API Routes"],
      },
      {
        week: 6,
        title: "Styling & UI Libraries",
        topics: ["Tailwind CSS", "Framer Motion", "Shadcn UI"],
      },
      {
        week: 7,
        title: "Testing & Deployment",
        topics: [
          "Jest & React Testing Library",
          "Vercel",
          "CI/CD Basics",
        ],
      },
      {
        week: 8,
        title: "Final Project",
        topics: [
          "Build a full e-commerce UI",
          "Performance Audits",
          "Deployment",
        ],
      },
    ],
    finalProject:
      "Fully responsive, accessible, and high-performance React/Next.js application",
  },
  {
    slug: "backend-engineer",
    name: "Backend Engineer",
    tagline:
      "Build scalable APIs, manage databases, and handle server-side architecture.",
    level: "Junior",
    durationWeeks: 8,
    modules: [
      {
        week: 1,
        title: "Node.js & Express",
        topics: ["REST APIs", "Middleware", "Error Handling"],
      },
      {
        week: 2,
        title: "Databases (SQL & NoSQL)",
        topics: ["PostgreSQL", "MongoDB", "ORM/ODM"],
      },
      {
        week: 3,
        title: "Authentication & Security",
        topics: ["JWT", "OAuth", "Role-Based Access Control"],
      },
      {
        week: 4,
        title: "Caching & Performance",
        topics: ["Redis", "Rate Limiting", "Query Optimization"],
      },
      {
        week: 5,
        title: "Microservices Basics",
        topics: ["Message Queues", "Event-Driven Architecture", "Docker"],
      },
      {
        week: 6,
        title: "GraphQL",
        topics: ["Schema Design", "Resolvers", "Apollo Server"],
      },
      {
        week: 7,
        title: "Testing & CI/CD",
        topics: [
          "Unit/Integration Testing",
          "GitHub Actions",
          "Docker Compose",
        ],
      },
      {
        week: 8,
        title: "Final Project",
        topics: [
          "Secure REST & GraphQL API",
          "Database Design",
          "Deployment",
        ],
      },
    ],
    finalProject:
      "Production-ready backend API with Authentication, Caching, and Microservices",
  },
  {
    slug: "cyber-security",
    name: "Cyber Security Specialist",
    tagline:
      "Protect systems, identify vulnerabilities, and secure infrastructure.",
    level: "Mid-Level",
    durationWeeks: 8,
    modules: [
      {
        week: 1,
        title: "Networking & Linux Security",
        topics: ["TCP/IP", "Firewalls", "OS Hardening"],
      },
      {
        week: 2,
        title: "Vulnerability Scanning",
        topics: ["Nmap", "Nessus", "OpenVAS"],
      },
      {
        week: 3,
        title: "Web Application Security",
        topics: ["OWASP Top 10", "SQL Injection", "XSS"],
      },
      {
        week: 4,
        title: "Penetration Testing",
        topics: ["Metasploit", "Burp Suite", "Privilege Escalation"],
      },
      {
        week: 5,
        title: "Cryptography",
        topics: ["Encryption Algorithms", "PKI", "SSL/TLS"],
      },
      {
        week: 6,
        title: "Incident Response",
        topics: ["Forensics", "Log Analysis", "SIEM"],
      },
      {
        week: 7,
        title: "Cloud Security",
        topics: ["AWS/Azure Security", "IAM", "Compliance"],
      },
      {
        week: 8,
        title: "Final Project",
        topics: [
          "Full Penetration Test Report",
          "Securing a vulnerable app",
          "SIEM Setup",
        ],
      },
    ],
    finalProject:
      "Complete security audit and remediation of a simulated vulnerable corporate network",
  },
  {
    slug: "devops-engineer",
    name: "DevOps Engineer",
    tagline:
      "From Linux basics to building a full CI/CD pipeline from code to production",
    level: "Beginner / Fresh",
    durationWeeks: 8,
    modules: [
      {
        week: 1,
        title: "Linux & Networking",
        topics: [
          "File Management",
          "Processes & Services",
          "Networking Basics",
        ],
      },
      {
        week: 2,
        title: "Git & Bash",
        topics: ["Branching & Merging", "Git workflows", "Practical Bash Scripts"],
      },
      {
        week: 3,
        title: "Docker",
        topics: ["Building Images", "Docker Compose", "Security Best Practices"],
      },
      {
        week: 4,
        title: "CI/CD",
        topics: ["GitHub Actions", "Automated Testing", "Build & Push"],
      },
      {
        week: 5,
        title: "Kubernetes",
        topics: ["Pods & Deployments", "Services & Ingress", "ConfigMaps & Secrets"],
      },
      {
        week: 6,
        title: "Cloud Fundamentals",
        topics: ["Cloud Resources", "Basic IAM", "Storage & Networks"],
      },
      {
        week: 7,
        title: "Terraform & Monitoring",
        topics: [
          "Infrastructure as Code",
          "Prometheus & Grafana",
          "Basic Alerts",
        ],
      },
      {
        week: 8,
        title: "Final Project",
        topics: [
          "Full pipeline setup",
          "Deploy to Kubernetes",
          "Monitoring & Dashboard",
        ],
      },
    ],
    finalProject:
      "GitHub → CI → Docker Build → Registry → Kubernetes → Prometheus/Grafana",
  },
  {
    slug: "platform-engineer",
    name: "Platform Engineer",
    tagline:
      "Build and run production-ready internal platforms, not just command execution",
    level: "Mid-Level",
    durationWeeks: 8,
    modules: [
      {
        week: 1,
        title: "Advanced Linux",
        topics: ["Deep Networking", "System Performance", "Systemd"],
      },
      {
        week: 2,
        title: "Containers",
        topics: ["OCI & Runtime", "Secure Image Builds", "Multi-stage builds"],
      },
      {
        week: 3,
        title: "Kubernetes",
        topics: ["Workloads", "Storage & Volumes", "RBAC"],
      },
      {
        week: 4,
        title: "Kubernetes Networking",
        topics: ["Services", "Ingress/Gateway", "NetworkPolicy"],
      },
      {
        week: 5,
        title: "Security",
        topics: ["Secrets Management", "SAST/Trivy", "Least Privilege"],
      },
      {
        week: 6,
        title: "GitOps",
        topics: ["ArgoCD", "Environment Management", "Automated Rollbacks"],
      },
      {
        week: 7,
        title: "Observability",
        topics: ["Metrics, Logs & Traces", "Dashboards", "Basic SLOs"],
      },
      {
        week: 8,
        title: "Final Project",
        topics: [
          "Internal Platform Design",
          "Full Automation",
          "Operational Docs",
        ],
      },
    ],
    finalProject:
      "GitOps platform: ArgoCD + Kubernetes + Prometheus + Grafana + RBAC",
  },
  {
    slug: "data-science",
    name: "Data Scientist",
    tagline:
      "Extract insights, build machine learning models, and analyze complex datasets.",
    level: "Junior",
    durationWeeks: 8,
    modules: [
      {
        week: 1,
        title: "Python for Data",
        topics: ["Pandas", "NumPy", "Data Cleaning"],
      },
      {
        week: 2,
        title: "Data Visualization",
        topics: ["Matplotlib", "Seaborn", "Storytelling"],
      },
      {
        week: 3,
        title: "Statistics",
        topics: ["Probability", "Hypothesis Testing", "A/B Testing"],
      },
      {
        week: 4,
        title: "Machine Learning Basics",
        topics: ["Scikit-Learn", "Regression", "Classification"],
      },
      {
        week: 5,
        title: "Advanced ML",
        topics: ["Clustering", "Ensemble Methods", "Model Tuning"],
      },
      {
        week: 6,
        title: "Deep Learning Intro",
        topics: [
          "Neural Networks",
          "TensorFlow/PyTorch",
          "Computer Vision Basics",
        ],
      },
      {
        week: 7,
        title: "NLP & GenAI",
        topics: ["Text Processing", "LLMs Basics", "RAG"],
      },
      {
        week: 8,
        title: "Final Project",
        topics: [
          "End-to-End ML Pipeline",
          "Deployment to API",
          "Dashboard",
        ],
      },
    ],
    finalProject:
      "Complete Machine Learning Model API with a Data Visualization Dashboard",
  },
];

// ─── Labs ─────────────────────────────────────────────────────────────────────

export type Lab = {
  id: string;
  track: string;
  title: string;
  scenario: string;
  checks: string[];
};

export const labs: Lab[] = [
  {
    id: "k8s-01",
    track: "Kubernetes",
    title: "Deploying Your First App",
    scenario:
      "You have a ready application that needs to be deployed on Kubernetes with 3 highly available replicas.",
    checks: [
      "Deployment exists",
      "Replicas count = 3",
      "All Pods are Running",
    ],
  },
  {
    id: "k8s-02",
    track: "Kubernetes",
    title: "Exposing App to the World",
    scenario:
      "The app is running inside the cluster but users need to access it from the outside via Service and Ingress.",
    checks: [
      "Service is created and linked",
      "Ingress routes traffic",
      "External request returns success",
    ],
  },
  {
    id: "frontend-01",
    track: "Frontend",
    title: "Accessible Navigation",
    scenario:
      "Fix accessibility issues in a React navigation component and ensure full keyboard support.",
    checks: [
      "ARIA labels added",
      "Keyboard focus trapped correctly",
      "Passes automated a11y checks",
    ],
  },
  {
    id: "security-01",
    track: "Cyber Security",
    title: "SQL Injection Remediation",
    scenario:
      "A legacy Node.js application is vulnerable to SQL injection. Identify the flaw and apply parameterized queries.",
    checks: [
      "Identify vulnerability",
      "Implement parameterized queries",
      "Pass security regression tests",
    ],
  },
  {
    id: "devops-01",
    track: "DevOps",
    title: "Build a CI/CD Pipeline",
    scenario:
      "Set up a full GitHub Actions pipeline that builds a Docker image, runs tests, and pushes to a registry.",
    checks: [
      "GitHub Actions workflow created",
      "Docker build succeeds",
      "Image pushed to registry",
    ],
  },
  {
    id: "platform-01",
    track: "Platform Engineering",
    title: "GitOps with ArgoCD",
    scenario:
      "Configure ArgoCD to watch a Git repository and automatically sync changes to a Kubernetes cluster.",
    checks: [
      "ArgoCD application created",
      "Auto-sync enabled",
      "Changes in Git reflect in cluster within 3 minutes",
    ],
  },
];

// ─── Journey ──────────────────────────────────────────────────────────────────

export const journey = [
  {
    step: 1,
    label: "Registration",
    desc: "Create an account and select your track of interest",
  },
  {
    step: 2,
    label: "Initial Assessment",
    desc: "Determine your current skill level",
  },
  {
    step: 3,
    label: "Learning Path",
    desc: "Weekly plan based on your assessment results",
  },
  {
    step: 4,
    label: "Hands-on Labs",
    desc: "Real-world tasks automatically evaluated",
  },
  {
    step: 5,
    label: "Final Project",
    desc: "Build and deploy a full project from scratch",
  },
  {
    step: 6,
    label: "Mentor Review",
    desc: "Direct feedback from a senior engineer",
  },
  {
    step: 7,
    label: "Certification",
    desc: "Verified certificate with a unique tracking ID",
  },
];

// ─── Stats ────────────────────────────────────────────────────────────────────

export const stats = [
  { label: "Registered Learners", value: 0, mono: "learners_total" },
  { label: "Completed Labs", value: 0, mono: "labs_completed" },
  { label: "Shipped Projects", value: 0, mono: "projects_shipped" },
  { label: "Active Mentors", value: 4, mono: "mentors_active" },
];
