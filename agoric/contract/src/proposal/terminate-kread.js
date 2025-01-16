import { E } from '@endo/far';

export const terminateKREAd = async ({
  consume: {
    kreadKit: kreadKitP,
    kreadCommitteeKit: kreadCommitteeKitP,
    kreadCharterKit: kreadCharterKitP,
  },
}) => {
  const { Fail } = assert;

  const { adminFacet, governorAdminFacet } = await kreadKitP;
  (adminFacet && adminFacet !== governorAdminFacet) ||
    Fail`instanceKit adminFacet should have been present and different from governorAdminFacet but was ${adminFacet}`;

  const governorReason = harden(Error(`core-eval terminating KREAd governor`));
  await E(governorAdminFacet).terminateContract(governorReason);

  const contractReason = harden(Error(`core-eval terminating KREAd contract`));
  await E(adminFacet).terminateContract(contractReason);

  const { adminFacet: committeeAdminFacet } = await kreadCommitteeKitP;
  const committeeReason = harden(
    Error(`core-eval terminating KREAd committee`),
  );
  await E(committeeAdminFacet).terminateContract(committeeReason);

  const { adminFacet: charterAdminFacet } = await kreadCharterKitP;
  const charterReason = harden(Error(`core-eval terminating KREAd charter`));
  await E(charterAdminFacet).terminateContract(charterReason);

  console.log(`KREAd terminated `);
};
harden(terminateKREAd);

export const getManifest = _powers => {
  return {
    manifest: {
      [terminateKREAd.name]: {
        consume: {
          kreadKit: true,
          kreadCommitteeKit: true,
          kreadCharterKit: true,
        },
      },
    },
  };
};

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').CoreEvalBuilder} */
export const defaultProposalBuilder = async () =>
  harden({
    sourceSpec: './terminate-kread.js',
    getManifestCall: ['getManifest'],
  });

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').DeployScriptFunction} */
export default async (homeP, endowments) => {
  const { makeHelpers } = await import('@agoric/deploy-script-support');
  const { writeCoreEval } = await makeHelpers(homeP, endowments);
  await writeCoreEval(terminateKREAd.name, defaultProposalBuilder);
};
