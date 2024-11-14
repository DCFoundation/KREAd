/* global setTimeout */

import test from 'ava';
import {
  provisionSmartWallet,
  USER1ADDR as Alice,
  GOV1ADDR as Bob,
  getIncarnation,
  evalBundles,
  agoric,
} from '@agoric/synthetic-chain';
import {
  waitUntilOfferExited,
  retryUntilCondition,
} from '@agoric/client-utils';
import {
  buyCharacter,
  getCharacterInventory,
  getMarketCharactersChildren,
  getBalanceFromPurse,
  mintCharacter,
  sellCharacter,
  installBundle,
} from './test-lib/kread.js';
import { agdWalletUtils } from './test-lib/index.js';

const ALICE_CHARACTER_ID = 'ephemeral_Joker';
const ALICE_MARKET_CHARACTER_ID = 'character-ephemeral_Joker';
const BOB_CHARACTER_ID = 'ephemeral_King';
const BOB_MARKET_CHARACTER_ID = 'character-ephemeral_King';
const ALICE_SELL_OFFER_ID = 'sell-before-zoe-upgrade';

const io = {
  now: Date.now,
  follow: agoric.follow,
  setTimeout,
};

test.before(async (t) => {
  const installContractBundleTX = await installBundle(
    'submission/b1-a2b6c9a070034f9881d0d28c1532bf455ff80611d213564ac8135dd5ef84ad0f053c65c7f43863eb4fdf6e2bfc46872d563307c7ab6f22889287f7de7b686de3.json',
  );
  t.is(
    installContractBundleTX.code,
    0,
    'Contract bundle failed to be installed',
  );

  const installManifestBundleTX = await installBundle(
    'submission/b1-de0eab9300715acb6ef75bafde5c00afb9110b60d2c36736989e08fe12e590ed7b8d2db1174e540e7e02f56026336a76f0837d6daa4ae0ad28e3e336dbe3c559.json',
  );
  t.is(
    installManifestBundleTX.code,
    0,
    'Contract bundle failed to be installed',
  );

  await provisionSmartWallet(Alice, '200000000ubld');
  await mintCharacter(Alice, ALICE_CHARACTER_ID);
  await mintCharacter(Bob, BOB_CHARACTER_ID);
});

test.serial('User assets survive KREAd contract upgrade', async (t) => {
  const characterBalanceBefore = await getBalanceFromPurse(Alice, 'character');
  t.is(
    characterBalanceBefore.name,
    ALICE_CHARACTER_ID,
    `Character name should be ${ALICE_CHARACTER_ID}`,
  );

  const characterInventoryBefore = await getCharacterInventory(
    ALICE_CHARACTER_ID,
  );
  t.is(
    characterInventoryBefore.length,
    3,
    'Character should have 3 items in inventory',
  );

  const incarnationBefore = await getIncarnation('zcf-b1-853ac-KREAd');

  await evalBundles('upgrade-kread');

  const incarnationAfter = await retryUntilCondition(
    async () => getIncarnation('zcf-b1-853ac-KREAd'),
    (value) => value === incarnationBefore + 1,
    'KREAd upgrade not processed yet',
    { setTimeout, retryIntervalMs: 5000, maxRetries: 15 },
  );

  t.is(
    incarnationAfter,
    incarnationBefore + 1,
    'KREAd vat incarnation should have increased',
  );

  const characterBalanceAfter = await getBalanceFromPurse(Alice, 'character');
  t.is(
    characterBalanceAfter.name,
    ALICE_CHARACTER_ID,
    `Character name should be ${ALICE_CHARACTER_ID}`,
  );

  const characterInventoryAfter = await getCharacterInventory(
    ALICE_CHARACTER_ID,
  );
  t.is(
    characterInventoryAfter.length,
    3,
    'Character should have 3 items in inventory',
  );
});

test.serial('market survives zoe upgrade', async (t) => {
  await sellCharacter(Alice, ALICE_SELL_OFFER_ID);
  await sellCharacter(Bob);

  const characterListBefore = await getMarketCharactersChildren();
  t.true(
    characterListBefore.includes(ALICE_MARKET_CHARACTER_ID),
    'Alice Character should be on market after selling',
  );
  t.true(
    characterListBefore.includes(BOB_MARKET_CHARACTER_ID),
    'Bob Character should be on market after selling',
  );

  const aliceCharacterBalanceBefore = await getBalanceFromPurse(
    Alice,
    'character',
  );
  t.is(
    aliceCharacterBalanceBefore,
    null,
    'Alice Character should not be in purse after selling',
  );

  const bobCharacterBalanceBefore = await getBalanceFromPurse(Bob, 'character');
  t.is(
    bobCharacterBalanceBefore,
    null,
    'Bob Character should not be in purse after selling',
  );

  const incarnationBefore = await getIncarnation('zoe');

  await evalBundles('upgrade-zoe');

  const incarnationAfter = await retryUntilCondition(
    async () => getIncarnation('zoe'),
    (value) => value === incarnationBefore + 1,
    'KREAd upgrade not processed yet',
    { setTimeout, retryIntervalMs: 5000, maxRetries: 15 },
  );

  t.is(
    incarnationAfter,
    incarnationBefore + 1,
    'Zoe vat incarnation should have increased',
  );

  await agdWalletUtils.broadcastBridgeAction(Alice, {
    method: 'tryExitOffer',
    offerId: ALICE_SELL_OFFER_ID,
  });

  await waitUntilOfferExited(
    Alice,
    ALICE_SELL_OFFER_ID,
    io,
  );

  const characterBalanceAfter = await getBalanceFromPurse(Alice, 'character');
  t.is(
    characterBalanceAfter.name,
    ALICE_CHARACTER_ID,
    `Character name should be ${ALICE_CHARACTER_ID}`,
  );

  const characterListAfter = await getMarketCharactersChildren();
  t.false(
    characterListAfter.includes(ALICE_MARKET_CHARACTER_ID),
    'Alice Character should not be on market after offer exit',
  );

  t.true(
    characterListAfter.includes(BOB_MARKET_CHARACTER_ID),
    'Bob Character should be on market after offer exit',
  );

  await buyCharacter(Bob);

  const characterList = await getMarketCharactersChildren();
  t.false(
    characterList.includes(BOB_MARKET_CHARACTER_ID),
    'Bob Character should not be on market after buying',
  );

  const characterBalance = await getBalanceFromPurse(Bob, 'character');
  t.is(
    characterBalance.name,
    BOB_CHARACTER_ID,
    `Character name should be ${BOB_CHARACTER_ID}`,
  );
});
