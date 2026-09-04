import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDriveDownloadUrl, normalizeDriveFileId } from './driveUtils.js';

test('drive URLs are converted to a clean Google Drive file id', () => {
  assert.equal(
    normalizeDriveFileId('https://drive.google.com/uc?export=download&id=16YZWrK4Ye9-M1lC6WjNrkKJ5G-A2J7-r'),
    '16YZWrK4Ye9-M1lC6WjNrkKJ5G-A2J7-r',
  );

  assert.equal(
    normalizeDriveFileId('https://drive.google.com/file/d/16YZWrK4Ye9-M1lC6WjNrkKJ5G-A2J7-r/view?usp=sharing'),
    '16YZWrK4Ye9-M1lC6WjNrkKJ5G-A2J7-r',
  );

  assert.equal(normalizeDriveFileId('16YZWrK4Ye9-M1lC6WjNrkKJ5G-A2J7-r'), '16YZWrK4Ye9-M1lC6WjNrkKJ5G-A2J7-r');
});

test('drive file ids are rendered as complete download URLs in the UI', () => {
  assert.equal(
    formatDriveDownloadUrl('16YZWrK4Ye9-M1lC6WjNrkKJ5G-A2J7-r'),
    'https://drive.google.com/uc?export=download&id=16YZWrK4Ye9-M1lC6WjNrkKJ5G-A2J7-r',
  );

  assert.equal(
    formatDriveDownloadUrl('https://drive.google.com/uc?export=download&id=16YZWrK4Ye9-M1lC6WjNrkKJ5G-A2J7-r'),
    'https://drive.google.com/uc?export=download&id=16YZWrK4Ye9-M1lC6WjNrkKJ5G-A2J7-r',
  );
});
