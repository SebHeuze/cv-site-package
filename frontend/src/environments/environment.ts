export const environment = {
  production: true
  // NOTE: grafanaPublicDashboardUrl is now loaded at runtime from /assets/config.json
  // and injected via ConfigMap in Kubernetes. See config.service.ts for implementation.
};
