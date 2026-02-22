export const CV_DATA = {
  about: {
    name: "Sébastien HEUZE",
    title: "Technical Lead",
    email: "heuze.seb@gmail.com",
    linkedin: "https://www.linkedin.com/in/sheuze/",
    github: {
      package: "https://github.com/SebHeuze/cv-site-package",
      gitops: "https://github.com/SebHeuze/cv-site-gitops"
    },
    languages: ["Français", "Anglais C1"],
    profile: "Passionné par la tech, je mène une veille continue, relève des défis techniques variés et m'adapte rapidement pour optimiser développement et production."
  },

  experiences: [
    {
      period: "Mai 2025 - Présent",
      company: "Prologistik France",
      role: "Architecte Solutions",
      tasks: [
        "Référent Kafka sur la conception et l'introduction de cette nouvelle solution de messaging au sein du SI",
        "Définition de l'architecture, mise en place des flux entrants/sortants",
        "Intégration des nouveaux clients"
      ]
    },
    {
      period: "Octobre 2018 - Présent",
      company: "Prologistik France",
      role: "Technical Lead R&D",
      tasks: [
        "Implication dès la phase de conception dans la création d'une application d'analyse de données et de visualisation (graphiques, tableaux de bord)",
        "Développement d'une base en mémoire maison, optimisée pour les performances et l'usage mémoire",
        "Mise en place d'un Data Warehouse via Kafka, agrégeant les données vers BigQuery et PostgreSQL",
        "Architecture des projets KStream, ajout d'un système complet de gestion d'erreurs, monitoring et tests automatisés avec Testcontainers",
        "Prise en charge et évolution de la fabrique logicielle : maintenance, industrialisation et ajout de nouvelles pipelines CI/CD",
        "Conception et maintenance des socles techniques mutualisés utilisés par l'ensemble des applications Prologistik",
        "Mise en place de l'authentification centralisée via Keycloak"
      ]
    },
    {
      period: "Septembre 2017 - Octobre 2018",
      company: "Capgemini",
      role: "Architecte Solutions Junior",
      tasks: [
        "Proposition d'architectures logicielles, conception d'applications SNCF",
        "Interopérabilité entre applications, sécurisation",
        "Fiabilisation des backend d'applications mobiles SNCF"
      ]
    },
    {
      period: "Février 2017 - Octobre 2018",
      company: "Capgemini",
      role: "Lead Tech Java/Angular",
      tasks: [
        "Création de socles techniques",
        "Suivi de plusieurs équipes de développement",
        "Mise en place de bonnes pratiques, formation des nouveaux arrivants",
        "Surveillance de la qualité d'un projet sur de multiples Backend SNCF"
      ]
    },
    {
      period: "Septembre 2015 - Février 2017",
      company: "Capgemini",
      role: "Ingénieur Logiciel",
      tasks: [
        "Réalisation d'applications diverses (Java, Angular, Mobile) pour la SNCF"
      ]
    },
    {
      period: "Septembre 2013 - Septembre 2015",
      company: "Capgemini",
      role: "Apprenti Ingénieur Logiciel",
      tasks: [
        "Réalisation d'applications diverses (Java, Angular, Mobile) pour la SNCF"
      ]
    },
    {
      period: "Septembre 2011 - Septembre 2012",
      company: "Atos",
      role: "Apprenti Analyste Développeur",
      tasks: [
        "Tierce maintenance applicative pour France Télécom (Projet Vantive)"
      ]
    }
  ],

  skills: {
    languages: ["Java 21+", "SpringBoot 3.5", "TypeScript", "Angular"],
    cloud: ["GCP", "Docker", "Kubernetes", "Grafana", "Ansible"],
    auth: ["Keycloak", "Authelia", "OAuth2"],
    data: ["Kafka", "Kafka Connect", "Kafka Streams", "PostgreSQL", "BigQuery", "Hibernate"],
    cicd: ["Gitlab-CI", "Jenkins"],
    observability: ["Grafana", "Sonarqube", "Gatlin"]
  },

  projects: [
    {
      name: "Auto-hébergement & NAS",
      description: "Auto-hébergement de sites web + stockage NAS sur serveur personnel comprenant sécurisation, backup, monitoring et déploiement via Docker. Experimentations Proxmox"
    },
    {
      name: "Domotique",
      description: "Système domotique sous home assistant"
    },
    {
      name: "Site de jeu en ligne",
      description: "Développement d'un site exploitant les données d'un jeu en ligne via rétro-ingénierie, gérant plus de 100 000 requêtes/jour (2015-2024)"
    }
  ],

  education: [
    {
      year: "2015",
      degree: "Master MIAGE",
      school: "Nantes"
    },
    {
      year: "2013",
      degree: "Licence 3 MIAGE",
      school: "Nantes"
    },
    {
      year: "2012",
      degree: "Licence professionnelle, Intégration et Maintenance applicative",
      school: "Vannes"
    },
    {
      year: "2011",
      degree: "DUT Informatique",
      school: "Vannes"
    }
  ]
};
