/**
 * Role constants and types for NRC-eGov
 * Production-ready role configuration
 */

export const ROLES = {
  MITANIN: 'Mitanin',
  ANGANWADI: 'Anganwadi Worker',
  PARENT: 'Parent',
  NURSE: 'Nurse / ANM',
  DOCTOR: 'Medical Officer',
  NRC_STAFF: 'NRC Staff',
  DISTRICT_OFFICER: 'District Health Officer',
  STATE_ADMIN: 'State Admin',
} as const;

/**
 * Role Type
 */
export type Role =
  typeof ROLES[keyof typeof ROLES];

/**
 * Simple array of role values
 */
export const ROLE_LIST: Role[] =
  Object.values(ROLES);

/**
 * Dropdown options
 */
export const ROLE_OPTIONS = ROLE_LIST.map(
  (role) => ({
    label: role,
    value: role,
  })
);

/**
 * Runtime role validator
 */
export const isRole = (
  value: unknown
): value is Role =>
  typeof value === 'string' &&
  ROLE_LIST.includes(value as Role);

export default ROLES;