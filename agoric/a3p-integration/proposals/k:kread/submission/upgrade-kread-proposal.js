import { E } from '@endo/far';

export const upgradeKread = async powers => {
  console.log('LOG: upgrading Kread');

  const {
    consume: { kreadKit: kreadKitP, kreadCommitteeCreatorFacet },
  } = powers;

  const initialPoserInvitation = await E(
    kreadCommitteeCreatorFacet,
  ).getPoserInvitation();

  const { adminFacet, privateArgs } = await kreadKitP;

  const newPrivateArgs = harden({
    ...privateArgs,
    initialPoserInvitation,
  });

  const bundleID =
    'b1-1ed215fa6131b937ffe2a73a858e4f246a7e3f63844ef30bb8baf262f125a63ab3c526c021886060c3519060aecac65bdd3da4b6d0cc9cc4a80306a9623c7a91';
  await E(adminFacet).upgradeContract(bundleID, newPrivateArgs);

  console.log('LOG: KREAd contract upgraded!');
};

export const getManifestForUpgradeKread = () => ({
  manifest: {
    [upgradeKread.name]: {
      consume: {
        kreadKit: true,
        kreadCommitteeCreatorFacet: true,
      },
    },
  },
});
