import test from 'ava';
import '@endo/init/debug.js';

import {
  USER1ADDR as Alice,
} from '@agoric/synthetic-chain';
import {
  buyItem,
  mintCharacter,
  buyCharacter,
  sellItem,
  sellCharacter,
} from './kread-lib.js';

test.serial('Verify that KREAd does not accept new offers', async (t) => {
  await t.throwsAsync(() => mintCharacter(Alice), {
    message: /Error: vat terminated/,
  });

  await t.throwsAsync(() => buyItem(Alice), {
    message: /Error: vat terminated/,
  });

  await t.throwsAsync(() => buyCharacter(Alice), {
    message: /Error: vat terminated/,
  });

  await t.throwsAsync(() => sellItem(Alice), {
    message: /Error: vat terminated/,
  });

  await t.throwsAsync(() => sellCharacter(Alice), {
    message: /Error: vat terminated/,
  });
});
