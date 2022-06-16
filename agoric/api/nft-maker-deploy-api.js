// @ts-check
/* global process */

// Agoric Dapp api deployment script

import fs from 'fs';
import { E } from '@endo/eventual-send';
import '@agoric/zoe/exported.js';
import { AmountMath } from '@agoric/ertp';

import installationConstants from '../../frontend/src/service/conf/installation-constants-nft-maker.js';

import { characters, KCB } from './characters.js';

const PRICE_PER_CHARACTER_IN_MONEY_UNITS = 1n;

// deploy.js runs in an ephemeral Node.js outside of swingset. The
// spawner runs within ag-solo, so is persistent.  Once the deploy.js
// script ends, connections to any of its objects are severed.

/**
 * @typedef {Object} DeployPowers The special powers that `agoric deploy` gives us
 * @property {(path: string) => Promise<{ moduleFormat: string, source: string }>} bundleSource
 * @property {(path: string) => string} pathResolve
 * @property {(path: string, opts?: any) => Promise<any>} installUnsafePlugin
 *
 * @typedef {Object} Board
 * @property {(id: string) => any} getValue
 * @property {(value: any) => string} getId
 * @property {(value: any) => boolean} has
 * @property {() => [string]} ids
 */

const API_PORT = process.env.API_PORT || '8000';

/**
 * @typedef {{ zoe: ZoeService, board: Board, spawner, wallet,
 * uploads, http, agoricNames, chainTimerService }} Home
 * @param {Promise<Home>} homePromise
 * A promise for the references available from REPL home
 * @param {DeployPowers} powers
 */
export default async function deployApi(
  homePromise,
  { pathResolve, bundleSource },
) {
  // Let's wait for the promise to resolve.
  const home = await homePromise;

  // Unpack the references.
  const {
    // *** ON-CHAIN REFERENCES ***
    chainTimerService: chainTimerServiceP,

    // The spawner persistently runs scripts within ag-solo, off-chain.
    spawner,

    // The http service allows registered handlers that are executed as part of
    // the ag-solo web server.
    http,

    // Zoe lives on-chain and is shared by everyone who has access to
    // the chain. In this demo, that's just you, but on our testnet,
    // everyone has access to the same Zoe.
    zoe,

    // The board is an on-chain object that is used to make private
    // on-chain objects public to everyone else on-chain. These
    // objects get assigned a unique string id. Given the id, other
    // people can access the object through the board. Ids and values
    // have a one-to-one bidirectional mapping. If a value is added a
    // second time, the original id is just returned.
    board,
  } = home;

  // To get the backend of our dapp up and running, first we need to
  // grab the installation that our contract deploy script put
  // in the public board.
  const {
    INSTALLATION_BOARD_ID,
    AUCTION_INSTALLATION_BOARD_ID,
    AUCTION_ITEMS_INSTALLATION_BOARD_ID,
    CONTRACT_NAME,
  } = installationConstants;
  const installation = await E(board).getValue(INSTALLATION_BOARD_ID);
  const auctionItemsInstallation = await E(board).getValue(
    AUCTION_ITEMS_INSTALLATION_BOARD_ID,
  );
  const auctionInstallation = await E(board).getValue(
    AUCTION_INSTALLATION_BOARD_ID,
  );

  // Second, we can use the installation to create a new instance of
  // our contract code on Zoe. A contract instance is a running
  // program that can take offers through Zoe. Making an instance will
  // give us a `creatorFacet` that will let us make invitations we can
  // send to users.

  const {
    creatorFacet: nftMakerSellerFacet,
    publicFacet: nftMakerPublicFacet,
    instance: instanceNftMaker,
  } = await E(zoe).startInstance(installation);

  console.log(instanceNftMaker);
  /**
   * @type {ERef<Issuer>}
   */
  const moneyIssuerP = E(home.agoricNames).lookup('issuer', 'RUN');

  const moneyBrandP = E(moneyIssuerP).getBrand();
  const [moneyIssuer, moneyBrand, { decimalPlaces = 0 }] = await Promise.all([
    moneyIssuerP,
    moneyBrandP,
    E(moneyBrandP).getDisplayInfo(),
  ]);

  const allcharacterNames = harden(KCB);
  const moneyValue =
    PRICE_PER_CHARACTER_IN_MONEY_UNITS * 10n ** BigInt(decimalPlaces);
  const minBidPercharacter = AmountMath.make(moneyBrand, moneyValue);

  const chainTimerService = await chainTimerServiceP;
  console.log(
    await E(nftMakerSellerFacet).initConfig(
      moneyIssuer,
      auctionInstallation,
      auctionItemsInstallation,
      chainTimerService,
    ),
  );
  const {
    // TODO: implement exiting the creatorSeat and taking the earnings
    auctionItemsPublicFacet: publicFacet,
    auctionItemsInstance: instance,
  } = await E(nftMakerSellerFacet).auctionCharacters(
    allcharacterNames,
    moneyIssuer,
    auctionInstallation,
    auctionItemsInstallation,
    minBidPercharacter,
    chainTimerService,
  );

  console.log('- SUCCESS! contract instance is running on Zoe');

  console.log('Retrieving Board IDs for issuers and brands');
  const invitationIssuerP = E(zoe).getInvitationIssuer();
  const invitationBrandP = E(invitationIssuerP).getBrand();

  const characterIssuerP = E(publicFacet).getItemsIssuer();
  const characterIssuerZCFP = E(nftMakerPublicFacet).getCharacterIssuer();
  const [
    characterIssuer,
    characterBrand,
    characterIssuerZCF,
    characterBrandZCF,
    invitationBrand,
    invitationIssuer,
  ] = await Promise.all([
    characterIssuerP,
    E(characterIssuerP).getBrand(),
    characterIssuerZCFP,
    E(characterIssuerZCFP).getBrand(),
    invitationBrandP,
    invitationBrandP,
  ]);

  const [
    INSTANCE_BOARD_ID,
    INSTANCE_NFT_MAKER_BOARD_ID,
    CHARACTER_BRAND_BOARD_ID,
    CHARACTER_ISSUER_BOARD_ID,
    CHARACTER_BRAND_ZCF_BOARD_ID,
    CHARACTER_ISSUER_ZCF_BOARD_ID,
    MONEY_BRAND_BOARD_ID,
    MONEY_ISSUER_BOARD_ID,
    INVITE_BRAND_BOARD_ID,
    INVITE_ISSUER_BOARD_ID,
  ] = await Promise.all([
    E(board).getId(instance),
    E(board).getId(instanceNftMaker),
    E(board).getId(characterBrand),
    E(board).getId(characterIssuer),
    E(board).getId(characterBrandZCF),
    E(board).getId(characterIssuerZCF),
    E(board).getId(moneyBrand),
    E(board).getId(moneyIssuer),
    E(board).getId(invitationBrand),
    E(board).getId(invitationIssuer),
  ]);

  console.log(`-- Contract Name: ${CONTRACT_NAME}`);
  console.log(`-- INSTANCE_BOARD_ID: ${INSTANCE_BOARD_ID}`);
  console.log(`-- INSTANCE_BOARD_ID: ${INSTANCE_NFT_MAKER_BOARD_ID}`);
  console.log(`-- CHARACTER_ISSUER_BOARD_ID: ${CHARACTER_ISSUER_BOARD_ID}`);
  console.log(`-- CHARACTER_BRAND_BOARD_ID: ${CHARACTER_BRAND_BOARD_ID}`);
  console.log(`-- INVITE_BRAND_BOARD_ID: ${INVITE_ISSUER_BOARD_ID}`);

  // We want the handler to run persistently. (Scripts such as this
  // deploy.js script are ephemeral and all connections to objects
  // within this script are severed when the script is done running.)

  const installURLHandler = async () => {
    // To run the URL handler persistently, we must use the spawner to run
    // the code on our ag-solo even after the deploy script exits.

    // Bundle up the handler code
    const bundle = await bundleSource(
      pathResolve('./src/handler-nft-maker.js'),
    );

    // Install it on the spawner
    const handlerInstall = await E(spawner).install(bundle);

    // Spawn the installed code to create an URL handler.
    const handler = await E(handlerInstall).spawn({
      nftMakerSellerFacet,
      nftMakerPublicFacet,
      board,
      http,
      chainTimerService,
      invitationIssuer,
      nfts: characters,
      mintArgs: {
        PRICE_PER_CHARACTER_IN_MONEY_UNITS: 1,
        decimalPlaces,
        moneyBrand,
        chainTimerService,
        auctionInstallation,
        auctionItemsInstallation,
      },
    });

    // Have our ag-solo wait on ws://localhost:8000/api/fungible-faucet for
    // websocket connections.
    await E(http).registerURLHandler(handler, '/api/nft-maker');
  };

  await installURLHandler();

  const API_URL = process.env.API_URL || `http://127.0.0.1:${API_PORT || 8000}`;

  // Re-save the constants somewhere where the UI and api can find it.
  const dappConstants = {
    INSTANCE_BOARD_ID,
    INSTANCE_NFT_MAKER_BOARD_ID,
    INSTALLATION_BOARD_ID,
    AUCTION_ITEMS_INSTALLATION_BOARD_ID,
    INVITE_BRAND_BOARD_ID,
    INVITE_ISSUER_BOARD_ID,
    BRIDGE_URL: 'agoric-lookup:https://local.agoric.com?append=/bridge',
    brandBoardIds: {
      Character: CHARACTER_BRAND_BOARD_ID,
      CharacterZCF: CHARACTER_BRAND_ZCF_BOARD_ID,
      Money: MONEY_BRAND_BOARD_ID,
    },
    issuerBoardIds: {
      Character: CHARACTER_ISSUER_BOARD_ID,
      CharacterZCF: CHARACTER_ISSUER_ZCF_BOARD_ID,
      Money: MONEY_ISSUER_BOARD_ID,
    },
    minBidPerCharacter: Number(moneyValue),
    API_URL,
    CONTRACT_NAME,
  };
  const defaultsFile = pathResolve(
    `../../frontend/src/service/conf/defaults.js`,
  );
  console.log('writing', defaultsFile);
  const defaultsContents = `\
// GENERATED FROM ${pathResolve('./deploy.js')}
export default ${JSON.stringify(dappConstants, undefined, 2)};
`;
  await fs.promises.writeFile(defaultsFile, defaultsContents);
}