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
    profile: "Passionate about tech, I continuously monitor the latest developments, tackle varied technical challenges and adapt quickly to optimize development and production."
  },

  experiences: [
    {
      period: "May 2025 – Present",
      company: "Prologistik France",
      role: "Solutions Architect",
      tasks: [
        "Kafka reference for the design and introduction of this new messaging solution within the IS",
        "Architecture definition, implementation of inbound/outbound flows",
        "Integration of new clients"
      ]
    },
    {
      period: "Oct. 2018 – Present",
      company: "Prologistik France",
      role: "Technical Lead R&D",
      tasks: [
        "Involved from the design phase in the creation of a data analysis and visualization application (charts, dashboards)",
        "Development of an in-house in-memory database, optimized for performance and memory usage",
        "Implementation of a Data Warehouse via Kafka, aggregating data to BigQuery and PostgreSQL",
        "Architecture of KStream projects, complete error management system, monitoring and automated testing with Testcontainers",
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
        "Software architecture proposals, design of SNCF applications",
        "Interoperability between applications, security hardening",
        "Reliability of SNCF mobile application backends"
      ]
    },
    {
      period: "Feb. 2017 – Oct. 2018",
      company: "Capgemini",
      role: "Java/Angular Tech Lead",
      tasks: [
        "Creation of technical foundations",
        "Management of several development teams",
        "Implementation of best practices, onboarding of new joiners",
        "Quality monitoring across multiple SNCF backends"
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
    languages: ["Java 21+", "SpringBoot 3.5", "TypeScript", "Angular"],
    cloud: ["GCP", "Docker", "Kubernetes", "Grafana", "Ansible"],
    auth: ["Keycloak", "Authelia", "OAuth2"],
    data: ["Kafka", "Kafka Connect", "Kafka Streams", "PostgreSQL", "BigQuery", "Hibernate"],
    cicd: ["Gitlab-CI", "Jenkins"],
    observability: ["Grafana", "SonarQube", "Gatling"]
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
