import test from 'node:test';
import assert from 'node:assert/strict';
import { getDisplayTitle } from './titleUtils.js';

test('english view uses a real translated title only when it exists', () => {
  const paper = {
    title: 'អក្សរសាស្ត្រខ្មែរ 2022',
    translated_title: '2022 Bac II Khmer Literature Examination',
  };

  assert.equal(getDisplayTitle(paper, 'en'), '2022 Bac II Khmer Literature Examination');
  assert.equal(getDisplayTitle({ ...paper, translated_title: '' }, 'en'), 'អក្សរសាស្ត្រខ្មែរ 2022');
  assert.equal(getDisplayTitle(paper, 'km'), 'អក្សរសាស្ត្រខ្មែរ 2022');
});
