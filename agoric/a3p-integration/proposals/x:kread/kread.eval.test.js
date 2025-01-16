// @ts-check
import test from 'ava';
import '@endo/init/debug.js';

import {
  provisionSmartWallet,
  USER1ADDR as Alice,
  evalBundles,
} from '@agoric/synthetic-chain';
import {
  getBalanceFromPurse,
  getCharacterInventory,
  mintCharacter,
  unequipAllItems,
} from './kread-lib.js';
import { getDetailsMatchingVats } from './vatDetails.js';
import { retryUntilCondition } from './utils.js';

/* These first 2 tests have the purpose of holding a KRAEd Character and Items in USER1ADDR
 * So it can be used during the x:kread test phase.
 */
test.serial('Alice mints a new Character', async t => {
  await provisionSmartWallet(Alice, '200000000ubld');
  const characterBalanceBefore = await getBalanceFromPurse(Alice, 'character');
  t.is(characterBalanceBefore, null, 'A Character should not exist in purse');

  await mintCharacter(Alice);

  const characterBalanceAfter = await getBalanceFromPurse(Alice, 'character');
  t.is(
    characterBalanceAfter.name,
    'ephemeral_Ace',
    'Minted Character name should be ephemeral_Ace',
  );
});

test.serial('Alice unequips all defaults Items', async t => {
  const itemBalanceBefore = await getBalanceFromPurse(Alice, 'item');
  t.is(itemBalanceBefore, null, 'An Item should not exist in purse');

  const characterId = 'ephemeral_Ace';
  const characterInventoryBefore = await getCharacterInventory(characterId);
  t.is(
    characterInventoryBefore.length,
    3,
    'Character should have 3 items in inventory',
  );

  await unequipAllItems(Alice);

  const characterInventoryAfter = await getCharacterInventory(characterId);
  t.is(
    characterInventoryAfter.length,
    0,
    'Character should have 0 items in inventory',
  );

  const itemBalanceAfter = await getBalanceFromPurse(Alice, 'item');
  t.is(
    itemBalanceAfter.description,
    characterInventoryBefore[0][0].description,
    'The unequipped Item should exist in purse',
  );
});

test.serial('verify that KREAd vats are terminated', async (t) => {
  const getKREAdVats = () => getDetailsMatchingVats('KREAd');
  const getCommitteeVats = () => getDetailsMatchingVats('kread');

  const initialKREAdVats = await getKREAdVats();
  t.true(initialKREAdVats.length === 2);

  const initialCommitteeVats = await getCommitteeVats();
  t.true(initialCommitteeVats.length === 2);

  await evalBundles('kread-submission');

  const checkForTermination = (vats) => {
    t.log(vats);
    return vats.length === 0;
  };

  await retryUntilCondition(
    getKREAdVats,
    checkForTermination,
    'KREAd contract and governor termination',
    { setTimeout, retryIntervalMs: 5000, maxRetries: 15 },
  );

  await retryUntilCondition(
    getCommitteeVats,
    checkForTermination,
    'KREAd committee and charter termination',
    { setTimeout, retryIntervalMs: 5000, maxRetries: 15 },
  );
});
