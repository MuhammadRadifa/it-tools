import { describe, expect, it } from 'vitest';
import { computeChmodOctalRepresentation, computeChmodSymbolicRepresentation, generatePermissionScript, parsePermissionInput } from './chmod-calculator.service';

describe('chmod-calculator', () => {
  describe('computeChmodOctalRepresentation', () => {
    it('get the octal representation from permissions', () => {
      expect(
        computeChmodOctalRepresentation({
          permissions: {
            owner: { read: true, write: true, execute: true },
            group: { read: true, write: true, execute: true },
            public: { read: true, write: true, execute: true },
          },
        }),
      ).to.eql('777');

      expect(
        computeChmodOctalRepresentation({
          permissions: {
            owner: { read: false, write: false, execute: false },
            group: { read: false, write: false, execute: false },
            public: { read: false, write: false, execute: false },
          },
        }),
      ).to.eql('000');

      expect(
        computeChmodOctalRepresentation({
          permissions: {
            owner: { read: false, write: true, execute: false },
            group: { read: false, write: true, execute: true },
            public: { read: true, write: false, execute: true },
          },
        }),
      ).to.eql('235');

      expect(
        computeChmodOctalRepresentation({
          permissions: {
            owner: { read: true, write: false, execute: false },
            group: { read: false, write: true, execute: false },
            public: { read: false, write: false, execute: true },
          },
        }),
      ).to.eql('421');

      expect(
        computeChmodOctalRepresentation({
          permissions: {
            owner: { read: false, write: false, execute: true },
            group: { read: false, write: true, execute: false },
            public: { read: true, write: false, execute: false },
          },
        }),
      ).to.eql('124');

      expect(
        computeChmodOctalRepresentation({
          permissions: {
            owner: { read: false, write: true, execute: false },
            group: { read: false, write: true, execute: false },
            public: { read: false, write: true, execute: false },
          },
        }),
      ).to.eql('222');
    });

    it('get the symbolic representation from permissions', () => {
      expect(
        computeChmodSymbolicRepresentation({
          permissions: {
            owner: { read: true, write: true, execute: true },
            group: { read: true, write: true, execute: true },
            public: { read: true, write: true, execute: true },
          },
        }),
      ).to.eql('rwxrwxrwx');

      expect(
        computeChmodSymbolicRepresentation({
          permissions: {
            owner: { read: false, write: false, execute: false },
            group: { read: false, write: false, execute: false },
            public: { read: false, write: false, execute: false },
          },
        }),
      ).to.eql('---------');

      expect(
        computeChmodSymbolicRepresentation({
          permissions: {
            owner: { read: false, write: true, execute: false },
            group: { read: false, write: true, execute: true },
            public: { read: true, write: false, execute: true },
          },
        }),
      ).to.eql('-w--wxr-x');

      expect(
        computeChmodSymbolicRepresentation({
          permissions: {
            owner: { read: true, write: false, execute: false },
            group: { read: false, write: true, execute: false },
            public: { read: false, write: false, execute: true },
          },
        }),
      ).to.eql('r---w---x');

      expect(
        computeChmodSymbolicRepresentation({
          permissions: {
            owner: { read: false, write: false, execute: true },
            group: { read: false, write: true, execute: false },
            public: { read: true, write: false, execute: false },
          },
        }),
      ).to.eql('--x-w-r--');

      expect(
        computeChmodSymbolicRepresentation({
          permissions: {
            owner: { read: false, write: true, execute: false },
            group: { read: false, write: true, execute: false },
            public: { read: false, write: true, execute: false },
          },
        }),
      ).to.eql('-w--w--w-');
    });
  });

  describe('parsePermissionInput', () => {
    it('parse a symbolic mode with a leading file type', () => {
      const parsed = parsePermissionInput('drwxr-xr-x');

      expect(parsed?.type).to.eql('directory');
      expect(parsed?.typeLabel).to.eql('Directory');
      expect(parsed?.octal).to.eql('755');
      expect(parsed?.symbolic).to.eql('rwxr-xr-x');
      expect(parsed?.descriptions).to.eql({
        owner: 'read, write, execute',
        group: 'read, execute',
        public: 'read, execute',
      });
      expect(parsed?.specialDescription).to.eql(null);
    });

    it('parse a symbolic mode without a file type', () => {
      const parsed = parsePermissionInput('rw-r--r--');

      expect(parsed?.type).to.eql(null);
      expect(parsed?.typeLabel).to.eql('Not specified');
      expect(parsed?.octal).to.eql('644');
      expect(parsed?.symbolic).to.eql('rw-r--r--');
    });

    it('parse a full ls -l entry', () => {
      const parsed = parsePermissionInput('-rw-r--r-- 1 user group 1234 Jan 1 12:00 file.txt');

      expect(parsed?.type).to.eql('file');
      expect(parsed?.typeLabel).to.eql('Regular file');
      expect(parsed?.octal).to.eql('644');
    });

    it('parse setuid, setgid and sticky bits', () => {
      const setuid = parsePermissionInput('-rwsr-xr-x');
      expect(setuid?.octal).to.eql('4755');
      expect(setuid?.symbolic).to.eql('rwsr-xr-x');
      expect(setuid?.specialBits).to.eql({ setuid: true, setgid: false, sticky: false });
      expect(setuid?.specialDescription).to.contain('setuid');

      const setgid = parsePermissionInput('-rwxr-sr-x');
      expect(setgid?.octal).to.eql('2755');
      expect(setgid?.symbolic).to.eql('rwxr-sr-x');
      expect(setgid?.specialBits).to.eql({ setuid: false, setgid: true, sticky: false });

      const sticky = parsePermissionInput('drwxrwxrwt');
      expect(sticky?.octal).to.eql('1777');
      expect(sticky?.symbolic).to.eql('rwxrwxrwt');
      expect(sticky?.specialBits).to.eql({ setuid: false, setgid: false, sticky: true });

      const upperCase = parsePermissionInput('-rwSr--r--');
      expect(upperCase?.octal).to.eql('4644');
      expect(upperCase?.symbolic).to.eql('rwSr--r--');
      expect(upperCase?.permissions.owner.execute).to.eql(false);
    });

    it('parse an octal mode', () => {
      expect(parsePermissionInput('755')?.symbolic).to.eql('rwxr-xr-x');
      expect(parsePermissionInput('0755')?.octal).to.eql('755');
      expect(parsePermissionInput('1777')?.octal).to.eql('1777');
      expect(parsePermissionInput('1777')?.symbolic).to.eql('rwxrwxrwt');
      expect(parsePermissionInput('000')?.symbolic).to.eql('---------');
    });

    it('return null on invalid input', () => {
      expect(parsePermissionInput('')).to.eql(null);
      expect(parsePermissionInput('   ')).to.eql(null);
      expect(parsePermissionInput('drwxr-x')).to.eql(null);
      expect(parsePermissionInput('999')).to.eql(null);
      expect(parsePermissionInput('hello')).to.eql(null);
      expect(parsePermissionInput('xrw-r--r--')).to.eql(null);
    });
  });

  describe('generatePermissionScript', () => {
    it('generate a chmod and chown script for a file', () => {
      expect(
        generatePermissionScript({
          octal: '644',
          path: '/var/www/index.html',
          isDirectory: false,
          recursive: true,
          sudo: true,
          owner: 'www-data',
          group: 'www-data',
        }),
      ).to.eql(
        [
          '# Change permissions',
          'sudo chmod 644 /var/www/index.html',
          '',
          '# Change ownership',
          'sudo chown www-data:www-data /var/www/index.html',
        ].join('\n'),
      );
    });

    it('generate a recursive chmod and chown script for a folder', () => {
      expect(
        generatePermissionScript({
          octal: '755',
          path: '/var/www/html',
          isDirectory: true,
          recursive: true,
          sudo: false,
          owner: 'www-data',
          group: 'www-data',
        }),
      ).to.eql(
        [
          '# Change permissions (recursive)',
          'chmod -R 755 /var/www/html',
          '',
          '# Change ownership (recursive)',
          'chown -R www-data:www-data /var/www/html',
        ].join('\n'),
      );
    });

    it('quote paths with spaces and fall back to placeholders', () => {
      const script = generatePermissionScript({
        octal: '644',
        path: '/var/www/my file.html',
        isDirectory: false,
        owner: '',
        group: '',
      });

      expect(script).to.contain('chmod 644 "/var/www/my file.html"');
      expect(script).to.contain('chown user:group "/var/www/my file.html"');
    });
  });
});
