export const CV_DATA = {
  about: {
    name: "Sébastien HEUZE",
    title: "Software Architect",
    email: "heuze.seb@gmail.com",
    linkedin: "https://www.linkedin.com/in/sheuze/",
    github: {
      package: "https://github.com/SebHeuze/cv-site-package",
      gitops: "https://github.com/SebHeuze/cv-site-gitops"
    },
    languages: ["French", "English C1"],
    profile: "Software Architect with 10+ years in Java/Spring and event-driven platforms. Kafka and Data Warehouse expert on GCP. Keen on AI-assisted development."
  },

  experiences: [
    {
      period: "May 2025 – Present",
      company: "Prologistik France",
      role: "Solutions Architect",
      tasks: [
        "Kafka referent on the design and rollout of this new messaging solution within the IS: architecture, inbound/outbound flows, and integration of new clients",
        "Cross-functional involvement in software architecture: application and technical design, patterns and tech choices, dev and security standards",
        "Led the experimentation and rollout of AI coding tools (Claude Code): best practices, internal guidelines, team onboarding",
        "Support for project and dev teams: technical framing, architecture and code reviews"
      ]
    },
    {
      period: "Oct. 2018 – May 2025",
      company: "Prologistik France",
      role: "Technical Lead R&D",
      tasks: [
        "Involvement from the design phase in building a data analysis and visualization application (charts, dashboards), including the development of a custom in-memory database, optimized for performance and memory usage",
        "Implementation of a Data Warehouse via Kafka (handling tens of millions of messages per day), aggregating data from multiple applications into BigQuery and PostgreSQL",
        "Architecture of KStream projects, complete error handling system, monitoring and automated tests with Testcontainers",
        "Ownership and evolution of the software factory: maintenance, industrialization and addition of new CI/CD pipelines",
        "Design and maintenance of shared technical foundations used across all Prologistik applications",
        "Implementation of centralized authentication via Keycloak"
      ]
    },
    {
      period: "Sept. 2017 – Oct. 2018",
      company: "Capgemini",
      role: "Junior Solutions Architect",
      tasks: [
        "Proposal of software architectures, design of SNCF applications",
        "Interoperability between applications, security and reliability improvements for SNCF mobile application backends"
      ]
    },
    {
      period: "Feb. 2017 – Oct. 2018",
      company: "Capgemini",
      role: "Java/Angular Tech Lead",
      tasks: [
        "Creation of technical foundations, oversight of several development teams",
        "Implementation of best practices, onboarding and training of newcomers",
        "Quality monitoring of a project across multiple SNCF backends"
      ]
    },
    {
      period: "Sept. 2015 – Feb. 2017",
      company: "Capgemini",
      role: "Software Engineer",
      tasks: [
        "Development of various applications (Java, Angular, Mobile) for SNCF"
      ]
    },
    {
      period: "Sept. 2013 – Sept. 2015",
      company: "Capgemini",
      role: "Apprentice Software Engineer",
      tasks: [
        "Development of various applications (Java, Angular, Mobile) for SNCF"
      ]
    },
    {
      period: "Sept. 2011 – Sept. 2012",
      company: "Atos",
      role: "Apprentice Developer / Analyst",
      tasks: [
        "Application maintenance for France Télécom (Vantive Project)"
      ]
    }
  ],

  skills: {
    languages: ["Java 25+", "SpringBoot 4", "TypeScript", "Angular"],
    cloud: ["GCP", "Docker", "Kubernetes", "Grafana", "Ansible"],
    auth: ["Keycloak", "Authelia", "OAuth2"],
    data: ["Kafka", "Kafka Connect", "Kafka Streams", "PostgreSQL", "BigQuery", "Hibernate"],
    cicd: ["Gitlab-CI", "Jenkins"],
    observability: ["Grafana", "SonarQube", "Gatling", "Testcontainers"]
  },

  projects: [
    {
      name: "Self-Hosting & NAS",
      description: "Self-hosting of websites + NAS storage on a personal server including security, backup, monitoring and deployment via Docker. Proxmox experiments."
    },
    {
      name: "Home Automation",
      description: "Home automation system with Home Assistant."
    },
    {
      name: "Online Game Website",
      description: "Development of a website exploiting data from an online game via reverse engineering, handling over 100,000 requests/day. (2015–2024)"
    }
  ],

  education: [
    {
      year: "2015",
      degree: "Master's MIAGE",
      school: "Nantes"
    },
    {
      year: "2013",
      degree: "Bachelor's MIAGE",
      school: "Nantes"
    },
    {
      year: "2012",
      degree: "Professional Bachelor's, Application Integration & Maintenance",
      school: "Vannes"
    },
    {
      year: "2011",
      degree: "DUT Computer Science",
      school: "Vannes"
    }
  ]
};
