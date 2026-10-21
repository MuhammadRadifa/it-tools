import _ from 'lodash';
import type { FileType, GroupPermissions, ParsedPermission, Permissions, SpecialBits } from './chmod-calculator.types';

export {
  computeChmodOctalRepresentation,
  computeChmodSymbolicRepresentation,
  parsePermissionInput,
  generatePermissionScript,
};

function computeChmodOctalRepresentation({ permissions }: { permissions: Permissions }): string {
  const permissionValue = { read: 4, write: 2, execute: 1 };

  const getGroupPermissionValue = (permission: GroupPermissions) =>
    _.reduce(permission, (acc, isPermSet, key) => acc + (isPermSet ? _.get(permissionValue, key, 0) : 0), 0);

  return [
    getGroupPermissionValue(permissions.owner),
    getGroupPermissionValue(permissions.group),
    getGroupPermissionValue(permissions.public),
  ].join('');
}

function computeChmodSymbolicRepresentation({ permissions }: { permissions: Permissions }): string {
  const permissionValue = { read: 'r', write: 'w', execute: 'x' };

  const getGroupPermissionValue = (permission: GroupPermissions) =>
    _.reduce(permission, (acc, isPermSet, key) => acc + (isPermSet ? _.get(permissionValue, key, '') : '-'), '');

  return [
    getGroupPermissionValue(permissions.owner),
    getGroupPermissionValue(permissions.group),
    getGroupPermissionValue(permissions.public),
  ].join('');
}

const fileTypes: Record<string, { type: FileType; label: string }> = {
  '-': { type: 'file', label: 'Regular file' },
  'd': { type: 'directory', label: 'Directory' },
  'l': { type: 'symlink', label: 'Symbolic link' },
  'b': { type: 'block-device', label: 'Block device' },
  'c': { type: 'character-device', label: 'Character device' },
  's': { type: 'socket', label: 'Socket' },
  'p': { type: 'pipe', label: 'Named pipe (FIFO)' },
};

const symbolicModePattern = /^([-dlbcsp])([r-])([w-])([xsS-])([r-])([w-])([xsS-])([r-])([w-])([xtT-])$/;

function describeGroupPermissions(permissions: GroupPermissions): string {
  const scopes: string[] = [];

  if (permissions.read) {
    scopes.push('read');
  }
  if (permissions.write) {
    scopes.push('write');
  }
  if (permissions.execute) {
    scopes.push('execute');
  }

  return scopes.length > 0 ? scopes.join(', ') : 'no permissions';
}

function describeSpecialBits(specialBits: SpecialBits): string | null {
  const descriptions: string[] = [];

  if (specialBits.setuid) {
    descriptions.push('setuid - the program runs with the privileges of the file owner');
  }
  if (specialBits.setgid) {
    descriptions.push('setgid - the program runs with the privileges of the file group');
  }
  if (specialBits.sticky) {
    descriptions.push('sticky - only the file owner can delete or rename it inside the directory');
  }

  return descriptions.length > 0 ? descriptions.join('; ') : null;
}

function buildParsedPermission({ type, typeLabel, permissions, specialBits }: {
  type: FileType | null
  typeLabel: string
  permissions: Permissions
  specialBits: SpecialBits
}): ParsedPermission {
  const octalRepresentation = computeChmodOctalRepresentation({ permissions });
  const specialValue = (specialBits.setuid ? 4 : 0) + (specialBits.setgid ? 2 : 0) + (specialBits.sticky ? 1 : 0);
  const octal = specialValue > 0 ? `${specialValue}${octalRepresentation}` : octalRepresentation;

  const executeSymbol = (group: GroupPermissions, specialChar: string | null) => {
    if (specialChar !== null) {
      return group.execute ? specialChar.toLowerCase() : specialChar;
    }

    return group.execute ? 'x' : '-';
  };

  const symbolic = [
    permissions.owner.read ? 'r' : '-',
    permissions.owner.write ? 'w' : '-',
    executeSymbol(permissions.owner, specialBits.setuid ? 'S' : null),
    permissions.group.read ? 'r' : '-',
    permissions.group.write ? 'w' : '-',
    executeSymbol(permissions.group, specialBits.setgid ? 'S' : null),
    permissions.public.read ? 'r' : '-',
    permissions.public.write ? 'w' : '-',
    executeSymbol(permissions.public, specialBits.sticky ? 'T' : null),
  ].join('');

  return {
    type,
    typeLabel,
    octal,
    symbolic,
    permissions,
    specialBits,
    descriptions: {
      owner: describeGroupPermissions(permissions.owner),
      group: describeGroupPermissions(permissions.group),
      public: describeGroupPermissions(permissions.public),
    },
    specialDescription: describeSpecialBits(specialBits),
  };
}

function parseSymbolicEntry(entry: string): ParsedPermission | null {
  const mode = /^[rwxstST-]{9}$/.test(entry) ? `-${entry}` : entry;
  const match = symbolicModePattern.exec(mode);

  if (match === null) {
    return null;
  }

  const [, typeChar, ownerRead, ownerWrite, ownerExecute, groupRead, groupWrite, groupExecute, publicRead, publicWrite, publicExecute] = match;
  const hasType = entry.length === mode.length;
  const { type, label } = fileTypes[typeChar];

  return buildParsedPermission({
    type: hasType ? type : null,
    typeLabel: hasType ? label : 'Not specified',
    permissions: {
      owner: { read: ownerRead === 'r', write: ownerWrite === 'w', execute: ownerExecute === 'x' || ownerExecute === 's' },
      group: { read: groupRead === 'r', write: groupWrite === 'w', execute: groupExecute === 'x' || groupExecute === 's' },
      public: { read: publicRead === 'r', write: publicWrite === 'w', execute: publicExecute === 'x' || publicExecute === 't' },
    },
    specialBits: {
      setuid: ownerExecute === 's' || ownerExecute === 'S',
      setgid: groupExecute === 's' || groupExecute === 'S',
      sticky: publicExecute === 't' || publicExecute === 'T',
    },
  });
}

function parseOctalEntry(entry: string): ParsedPermission | null {
  if (!/^[0-7]{3,4}$/.test(entry)) {
    return null;
  }

  const [specialDigit, ownerDigit, groupDigit, publicDigit] = entry.padStart(4, '0').split('').map(Number);
  const toGroupPermissions = (value: number): GroupPermissions => ({
    read: (value & 4) !== 0,
    write: (value & 2) !== 0,
    execute: (value & 1) !== 0,
  });

  return buildParsedPermission({
    type: null,
    typeLabel: 'Not specified',
    permissions: {
      owner: toGroupPermissions(ownerDigit),
      group: toGroupPermissions(groupDigit),
      public: toGroupPermissions(publicDigit),
    },
    specialBits: {
      setuid: (specialDigit & 4) !== 0,
      setgid: (specialDigit & 2) !== 0,
      sticky: (specialDigit & 1) !== 0,
    },
  });
}

function parsePermissionInput(input: string): ParsedPermission | null {
  const entry = input.trim().split(/\s+/)[0] ?? '';

  if (entry === '') {
    return null;
  }

  return parseSymbolicEntry(entry) ?? parseOctalEntry(entry);
}

function shellArgument(argument: string): string {
  return /\s/.test(argument) && !/^['"].*['"]$/.test(argument) ? `"${argument}"` : argument;
}

function generatePermissionScript({ octal, path, isDirectory, recursive = true, sudo = false, owner = '', group = '' }: {
  octal: string
  path: string
  isDirectory: boolean
  recursive?: boolean
  sudo?: boolean
  owner?: string
  group?: string
}): string {
  const target = shellArgument(path.trim() || (isDirectory ? 'path/to/folder' : 'path/to/file'));
  const recursiveFlag = isDirectory && recursive ? '-R ' : '';
  const sudoPrefix = sudo ? 'sudo ' : '';
  const recursiveSuffix = recursiveFlag === '' ? '' : ' (recursive)';
  const ownerSpec = `${owner.trim() || 'user'}:${group.trim() || 'group'}`;

  return [
    `# Change permissions${recursiveSuffix}`,
    `${sudoPrefix}chmod ${recursiveFlag}${octal} ${target}`,
    '',
    `# Change ownership${recursiveSuffix}`,
    `${sudoPrefix}chown ${recursiveFlag}${ownerSpec} ${target}`,
  ].join('\n');
}
