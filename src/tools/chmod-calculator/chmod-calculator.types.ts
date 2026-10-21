export type Scope = 'read' | 'write' | 'execute';
export type Group = 'owner' | 'group' | 'public';

export type GroupPermissions = {
  [k in Scope]: boolean
};

export type Permissions = {
  [k in Group]: GroupPermissions
};

export type FileType = 'file' | 'directory' | 'symlink' | 'block-device' | 'character-device' | 'socket' | 'pipe';

export interface SpecialBits {
  setuid: boolean
  setgid: boolean
  sticky: boolean
}

export interface ParsedPermission {
  type: FileType | null
  typeLabel: string
  octal: string
  symbolic: string
  permissions: Permissions
  specialBits: SpecialBits
  descriptions: Record<Group, string>
  specialDescription: string | null
}
