export const Role = {
  KARYAWAN: {
    priority: 1,
    roleName: "karyawan",
  },
  SPV: {
    priority: 2,
    roleName: "spv",
  },
  MANAGER: {
    priority: 3,
    roleName: "manager",
  },
  GENERAL_MANAGER: {
    priority: 4,
    roleName: "general manager",
  },
  DIREKTUR: {
    priority: 5,
    roleName: "direktur",
  },
} as const;
export type Role = (typeof Role)[keyof typeof Role];
