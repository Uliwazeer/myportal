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

export type SessionType =
  | "Consultation"
  | "Mentorship"
  | "Career Guidance"
  | "Technical Review"
  | "CV Review"
  | "Mock Interview";

export const sessionTypes: { id: SessionType; label: string; desc: string; defaultDuration: 40 | 60 }[] = [
  { id: "Consultation", label: "Consultation", desc: "Targeted problem solving, architecture & system design", defaultDuration: 40 },
  { id: "Mentorship", label: "Structured Mentorship", desc: "Long-term skill building & code review guidance", defaultDuration: 60 },
  { id: "Career Guidance", label: "Career Guidance", desc: "Roadmap planning, promotions & job hunt advice", defaultDuration: 40 },
  { id: "Technical Review", label: "Technical & Code Review", desc: "Detailed inspection of your project or PRs", defaultDuration: 60 },
  { id: "CV Review", label: "CV & Portfolio Review", desc: "ATS optimization and portfolio refinement", defaultDuration: 40 },
  { id: "Mock Interview", label: "Technical Mock Interview", desc: "Simulated IT engineering interview with feedback", defaultDuration: 60 },
];

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "upcoming"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "rescheduled"
  | "no-show";

export type Booking = {
  id: string;
  userId: string;
  mentorId: string;
  trackSlug: string;
  sessionType?: SessionType;
  date: string; // ISO date string "2026-09-05"
  time: string; // "19:00"
  duration: 40 | 60;
  topic?: string;
  status: BookingStatus;
  rescheduledFrom?: { date: string; time: string };
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

export type MentoredPerson = {
  name: string;
  type: "Internship" | "Consultation";
  topicOrTrack: string;
  rating: number;
  date: string;
  feedback: string;
};

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
  completedConsultations: number;
  menteesCount: number;
  consultationHours: number;
  responseRate: number; // percentage
  attendanceRate: number; // percentage
  availability: AvailabilitySlot[];
  initials: string;
  color: string; // tailwind accent color class for avatar bg
  featuredReview?: {
    userName: string;
    comment: string;
    rating: number;
  };
  mentoredPeople: MentoredPerson[];
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
    completedConsultations: 142,
    menteesCount: 38,
    consultationHours: 195,
    responseRate: 99,
    attendanceRate: 100,
    availability: [
      { day: "Monday", startTime: "18:00", endTime: "22:00" },
      { day: "Wednesday", startTime: "18:00", endTime: "22:00" },
      { day: "Saturday", startTime: "14:00", endTime: "20:00" },
    ],
    initials: "AW",
    color: "bg-red-600",
    featuredReview: {
      userName: "Ahmed M. (Intern)",
      comment: "Super in-depth Kubernetes session. Solved our production ingress issue in 40 minutes!",
      rating: 5,
    },
    mentoredPeople: [
      {
        name: "Ahmed Mahmoud",
        type: "Internship",
        topicOrTrack: "Platform Engineering",
        rating: 5,
        date: "Aug 2026",
        feedback: "Learned GitOps and ArgoCD architecture from scratch. Now working with production clusters.",
      },
      {
        name: "Khaled Hassan",
        type: "Consultation",
        topicOrTrack: "Kubernetes Cluster Ingress & SSL",
        rating: 5,
        date: "Aug 2026",
        feedback: "Fixed our production Cilium network policy conflict in one 60-min session.",
      },
      {
        name: "Nouran Tarek",
        type: "Internship",
        topicOrTrack: "DevOps & Cloud",
        rating: 4.9,
        date: "Jul 2026",
        feedback: "Ali guided me through CI/CD pipelines with GitHub Actions and Terraform.",
      },
      {
        name: "Mostafa Adel",
        type: "Consultation",
        topicOrTrack: "Prometheus Monitoring Stack",
        rating: 5,
        date: "Jul 2026",
        feedback: "Configured multi-tenant Grafana dashboards and alerts in under an hour.",
      },
    ],
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
    completedConsultations: 98,
    menteesCount: 29,
    consultationHours: 135,
    responseRate: 97,
    attendanceRate: 99,
    availability: [
      { day: "Tuesday", startTime: "19:00", endTime: "23:00" },
      { day: "Thursday", startTime: "19:00", endTime: "23:00" },
      { day: "Friday", startTime: "16:00", endTime: "22:00" },
    ],
    initials: "AD",
    color: "bg-orange-600",
    featuredReview: {
      userName: "Mohamed S. (Consultation)",
      comment: "Adnan helped architect our microservices communication with Redis and Kafka seamlessly.",
      rating: 5,
    },
    mentoredPeople: [
      {
        name: "Mohamed Samir",
        type: "Consultation",
        topicOrTrack: "Microservices & Redis Caching",
        rating: 5,
        date: "Aug 2026",
        feedback: "Solved database deadlocks and redesigned our PostgreSQL queries.",
      },
      {
        name: "Youssef Ibrahim",
        type: "Internship",
        topicOrTrack: "Backend Engineering",
        rating: 4.8,
        date: "Jul 2026",
        feedback: "Built a production-ready GraphQL authentication service under Adnan's mentorship.",
      },
      {
        name: "Dina Farouk",
        type: "Consultation",
        topicOrTrack: "NestJS Clean Architecture",
        rating: 5,
        date: "Jul 2026",
        feedback: "Clear architectural guidance for our company's REST API revamp.",
      },
    ],
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
    completedConsultations: 85,
    menteesCount: 24,
    consultationHours: 110,
    responseRate: 98,
    attendanceRate: 100,
    availability: [
      { day: "Monday", startTime: "20:00", endTime: "23:00" },
      { day: "Wednesday", startTime: "20:00", endTime: "23:00" },
      { day: "Saturday", startTime: "10:00", endTime: "16:00" },
    ],
    initials: "YM",
    color: "bg-blue-600",
    featuredReview: {
      userName: "Omar K. (Intern)",
      comment: "Outstanding mentor. Taught me realistic web vulnerability testing and reporting.",
      rating: 5,
    },
    mentoredPeople: [
      {
        name: "Omar Kamal",
        type: "Internship",
        topicOrTrack: "Cyber Security Specialist",
        rating: 5,
        date: "Aug 2026",
        feedback: "Hands-on penetration testing labs and real OWASP vulnerability hunting.",
      },
      {
        name: "Amr Nabil",
        type: "Consultation",
        topicOrTrack: "AWS Security Audit & IAM",
        rating: 4.9,
        date: "Jul 2026",
        feedback: "Conducted security hardening and identified open S3 permissions instantly.",
      },
      {
        name: "Salma Saeed",
        type: "Internship",
        topicOrTrack: "Web Application Security",
        rating: 5,
        date: "Jun 2026",
        feedback: "Yamen's mentorship helped me land my first Junior Security Analyst job.",
      },
    ],
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
    completedConsultations: 63,
    menteesCount: 21,
    consultationHours: 85,
    responseRate: 96,
    attendanceRate: 98,
    availability: [
      { day: "Sunday", startTime: "14:00", endTime: "20:00" },
      { day: "Thursday", startTime: "18:00", endTime: "22:00" },
    ],
    initials: "SJ",
    color: "bg-green-600",
    featuredReview: {
      userName: "Karim T. (Consultation)",
      comment: "Extremely knowledgeable in Linux performance troubleshooting and server clustering.",
      rating: 5,
    },
    mentoredPeople: [
      {
        name: "Karim Tawfik",
        type: "Consultation",
        topicOrTrack: "Linux Server Performance & Storage",
        rating: 5,
        date: "Aug 2026",
        feedback: "Resolved high CPU load and configured automated LVM backups on Ubuntu servers.",
      },
      {
        name: "Ziad Fathi",
        type: "Internship",
        topicOrTrack: "System Administration & DevOps",
        rating: 4.7,
        date: "Jul 2026",
        feedback: "Learned Active Directory migration and enterprise bash automation scripts.",
      },
    ],
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
  {
    slug: "embedded-systems",
    name: "Embedded Systems Engineer",
    tagline:
      "Master microcontrollers, C/C++, RTOS, IoT protocols, and hardware-software interfacing.",
    level: "Mid-Level",
    durationWeeks: 8,
    modules: [
      {
        week: 1,
        title: "C / C++ for Embedded",
        topics: ["Pointers & Memory", "Bitwise Operations", "Structures & Unions"],
      },
      {
        week: 2,
        title: "Microcontroller Architecture",
        topics: ["ARM Cortex-M", "GPIOs", "Timers & Interrupts"],
      },
      {
        week: 3,
        title: "Communication Protocols",
        topics: ["UART", "SPI", "I2C", "CAN Bus"],
      },
      {
        week: 4,
        title: "Real-Time Operating Systems",
        topics: ["FreeRTOS Tasks", "Semaphores & Mutexes", "Queues"],
      },
      {
        week: 5,
        title: "Sensors & Actuators Interfacing",
        topics: ["ADC/DAC", "PWM Motor Control", "Sensor Drivers"],
      },
      {
        week: 6,
        title: "IoT & Wireless Protocols",
        topics: ["ESP32 / Wi-Fi", "Bluetooth Low Energy (BLE)", "MQTT"],
      },
      {
        week: 7,
        title: "Debugging & Hardware Testing",
        topics: ["Logic Analyzers", "Oscilloscopes", "JTAG / SWD Debugging"],
      },
      {
        week: 8,
        title: "Final Project",
        topics: [
          "IoT Smart Embedded Node",
          "FreeRTOS Architecture",
          "Cloud Telemetry & Control",
        ],
      },
    ],
    finalProject:
      "Production-grade IoT Embedded Controller with FreeRTOS, Sensor Hub, and Cloud MQTT Dashboard",
  },
];

export type LabDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type Lab = {
  id: string;
  track: string;
  title: string;
  scenario: string;
  difficulty: LabDifficulty;
  estimatedTime?: string;
  xp?: number;
  prerequisites?: string;
  checks: string[];
};

export const labs: Lab[] = [
  // DevOps & Containers
  {
    id: "devops-01",
    track: "DevOps",
    title: "Linux Command Line & Process Management",
    scenario: "Inspect CPU-heavy background processes, configure systemd daemon services, and set up cron job automation.",
    difficulty: "Beginner",
    estimatedTime: "45 mins",
    xp: 50,
    prerequisites: "None",
    checks: ["Systemd service created", "Logs verified with journalctl", "Cron job scheduled"],
  },
  {
    id: "devops-02",
    track: "DevOps",
    title: "Dockerizing a Microservice",
    scenario: "Write an optimized multi-stage Dockerfile for a Node/Go microservice and run with environment variables.",
    difficulty: "Beginner",
    estimatedTime: "60 mins",
    xp: 75,
    prerequisites: "Linux Basics",
    checks: ["Multi-stage Dockerfile built", "Image size < 100MB", "Container exposes port 8080"],
  },
  {
    id: "devops-03",
    track: "DevOps",
    title: "Multi-Service Architecture with Docker Compose",
    scenario: "Orchestrate a web API, Redis cache, and Postgres DB network with persistent volumes and healthchecks.",
    difficulty: "Intermediate",
    estimatedTime: "90 mins",
    xp: 100,
    prerequisites: "Docker Basics",
    checks: ["Compose services connected", "Volume persistence verified", "Healthchecks passing"],
  },
  {
    id: "devops-04",
    track: "DevOps",
    title: "Production CI/CD with GitHub Actions",
    scenario: "Automate test matrix execution, semantic version tagging, and automated container image deployment.",
    difficulty: "Intermediate",
    estimatedTime: "90 mins",
    xp: 120,
    prerequisites: "Git & Docker",
    checks: ["CI workflow passes test suites", "Docker build & cache enabled", "Pushed to registry"],
  },
  {
    id: "k8s-01",
    track: "Kubernetes",
    title: "Zero-Downtime Deployment & Rolling Updates",
    scenario: "Deploy high-availability application replicas with readiness/liveness probes and rolling updates.",
    difficulty: "Intermediate",
    estimatedTime: "90 mins",
    xp: 120,
    prerequisites: "Docker",
    checks: ["Deployment with 3 replicas", "Liveness probe configured", "Zero downtime during update"],
  },
  {
    id: "k8s-02",
    track: "Kubernetes",
    title: "Ingress Routing & SSL Certificate Automation",
    scenario: "Expose microservices to public domains with Ingress Controller, routing rules, and Let's Encrypt TLS.",
    difficulty: "Advanced",
    estimatedTime: "120 mins",
    xp: 160,
    prerequisites: "Kubernetes Basics",
    checks: ["Ingress Controller active", "TLS Secret mounted", "Path routing validated"],
  },

  // Cloud & Infrastructure
  {
    id: "cloud-01",
    track: "Cloud / AWS",
    title: "VPC Networking & Security Groups",
    scenario: "Design an isolated Cloud VPC with public/private subnets, NAT Gateway, and fine-grained security groups.",
    difficulty: "Beginner",
    estimatedTime: "60 mins",
    xp: 75,
    prerequisites: "Networking Basics",
    checks: ["VPC & subnets configured", "Route tables defined", "NAT gateway routing traffic"],
  },
  {
    id: "cloud-02",
    track: "Cloud / AWS",
    title: "Infrastructure as Code with Terraform",
    scenario: "Provision scalable AWS/Cloud infrastructure using modular Terraform templates with remote state locking.",
    difficulty: "Advanced",
    estimatedTime: "120 mins",
    xp: 180,
    prerequisites: "Cloud VPC Basics",
    checks: ["Terraform plan verified", "Modules instantiated", "State locked in DynamoDB/S3"],
  },

  // AI & Prompt Engineering
  {
    id: "ai-01",
    track: "Prompt Engineering",
    title: "Few-Shot Prompting & Structured Output Formatting",
    scenario: "Construct system prompts with few-shot exemplars and force strict JSON Schema outputs from LLMs.",
    difficulty: "Beginner",
    estimatedTime: "45 mins",
    xp: 60,
    prerequisites: "None",
    checks: ["System instructions crafted", "Few-shot examples defined", "Outputs valid JSON Schema"],
  },
  {
    id: "ai-02",
    track: "AI & GenAI",
    title: "Building a Retrieval-Augmented Generation (RAG) System",
    scenario: "Index company documents into a Vector DB, generate embeddings, and query with similarity search & LLM context.",
    difficulty: "Advanced",
    estimatedTime: "120 mins",
    xp: 190,
    prerequisites: "Python & LLM Basics",
    checks: ["Documents chunked & embedded", "Vector search top-k accurate", "LLM responds with source citations"],
  },

  // Cyber Security
  {
    id: "sec-01",
    track: "Cyber Security",
    title: "Web Security: SQL Injection & XSS Remediation",
    scenario: "Audit a vulnerable web application, identify injection vectors, and enforce parameterized queries & CSP headers.",
    difficulty: "Intermediate",
    estimatedTime: "75 mins",
    xp: 110,
    prerequisites: "Web Basics",
    checks: ["Vulnerability reproduced", "Sanitization & ORM implemented", "Regression scan clean"],
  },
  {
    id: "sec-02",
    track: "Cyber Security",
    title: "Network Threat Analysis & Firewall Rules",
    scenario: "Analyze packet capture logs in Wireshark, detect suspicious port scans, and configure iptables mitigation.",
    difficulty: "Advanced",
    estimatedTime: "100 mins",
    xp: 150,
    prerequisites: "Networking & Linux",
    checks: ["Malicious IP detected", "Firewall drop rule applied", "Traffic normalized"],
  },

  // Frontend & Backend Engineering
  {
    id: "front-01",
    track: "Frontend",
    title: "Accessible Navigation & State Synchronization",
    scenario: "Build a WCAG-compliant responsive navigation bar with full keyboard traps and URL query param state syncing.",
    difficulty: "Beginner",
    estimatedTime: "50 mins",
    xp: 70,
    prerequisites: "HTML/CSS/JS",
    checks: ["ARIA compliance 100%", "Keyboard focus trapped", "State synced with URL"],
  },
  {
    id: "back-01",
    track: "Backend",
    title: "High-Throughput Rate Limiter & Redis Caching",
    scenario: "Implement token bucket rate limiting on API endpoints with distributed Redis storage and exponential backoff.",
    difficulty: "Intermediate",
    estimatedTime: "80 mins",
    xp: 130,
    prerequisites: "REST APIs & Redis",
    checks: ["Token bucket algorithm applied", "Redis latency < 2ms", "HTTP 429 returned on limit"],
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
