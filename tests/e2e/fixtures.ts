// Test-only accounts for the throwaway in-memory database used by the e2e suite.
export const E2E_USERS = {
  owner: {
    name: "E2E Owner",
    email: "owner@e2e.test",
    password: "E2e-owner-pass-1",
    role: "owner",
  },
  editor: {
    name: "E2E Editor",
    email: "editor@e2e.test",
    password: "E2e-editor-pass-1",
    role: "editor",
  },
  sales: {
    name: "E2E Sales",
    email: "sales@e2e.test",
    password: "E2e-sales-pass-1",
    role: "sales",
  },
} as const;

export const E2E_PORT = 3100;
