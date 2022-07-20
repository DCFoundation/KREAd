import { E } from "@endo/eventual-send";
import { Character, Item } from "../../interfaces";
import { AgoricDispatch } from "../../interfaces/agoric.interfaces";
import { CharacterDispatch } from "../../interfaces/character-actions.interfaces";
import { ItemDispatch } from "../../interfaces/item-actions.interfaces";

// This fetches assets data from purses in the wallet and updates the local context state for characters & items
export const processPurses = async (
  purses: any[],
  contractPublicFacet: any,
  characterDispatch: CharacterDispatch,
  itemDispatch: ItemDispatch,
  agoricDispatch: AgoricDispatch,
  brandsToCheck: { money: string; character: string; item: string }
) => {
  // Load Purses
  const newTokenPurses = purses.filter(({ brandBoardId }) => brandBoardId === brandsToCheck.money);
  const newCharacterPurses = purses.filter(
    ({ brandBoardId }) => brandBoardId === brandsToCheck.character // || brandBoardId === CHARACTER_ZFC_BRAND_BOARD_ID,
  );
  const newItemPurses = purses.filter(
    ({ brandBoardId }) => brandBoardId === brandsToCheck.item // || brandBoardId === CHARACTER_ZFC_BRAND_BOARD_ID,
  );

  agoricDispatch({ type: "SET_TOKEN_PURSES", payload: newTokenPurses });
  agoricDispatch({ type: "SET_CHARACTER_PURSES", payload: newCharacterPurses });
  agoricDispatch({ type: "SET_ITEM_PURSES", payload: newItemPurses });

  // Load Characters
  const ownedCharacters = newCharacterPurses.flatMap((purse) => {
    return purse.value;
  });

  const equippedCharacterItems: Item[] = [];
  // Map characters to the corresponding inventory in the contract
  const charactersWithItems = await Promise.all(
    ownedCharacters.map(async (character: Character) => {
      const {
        items: { value: equippedItems },
      } = await E(contractPublicFacet).getCharacterInventory(character.name);

      equippedCharacterItems.push(...equippedItems);
      return {
        ...character,
        items: {
          hair: equippedItems.filter((item: Item) => item.category === "hair")[0],
          headPiece: equippedItems.filter((item: Item) => item.category === "headPiece")[0],
          noseline: equippedItems.filter((item: Item) => item.category === "noseline")[0],
          background: equippedItems.filter((item: Item) => item.category === "background")[0],
          midBackground: equippedItems.filter((item: Item) => item.category === "midBackground")[0],
          mask: equippedItems.filter((item: Item) => item.category === "mask")[0],
          airReservoir: equippedItems.filter((item: Item) => item.category === "airReservoir")[0],
          liquid: equippedItems.filter((item: Item) => item.category === "liquid")[0],
          clothing: equippedItems.filter((item: Item) => item.category === "clothing")[0],
          frontMask: equippedItems.filter((item: Item) => item.category === "frontMask")[0],
        },
      };
    })
  );

  if (charactersWithItems.length) {
    characterDispatch({ type: "SET_OWNED_CHARACTERS", payload: charactersWithItems });
    characterDispatch({ type: "SET_SELECTED_CHARACTER", payload: charactersWithItems[0] });
  }
  // Finish loading Characters
  characterDispatch({ type: "SET_FETCHED", payload: true });

  // Load owned Items from wallet and character inventories
  const ownedItems = newItemPurses.flatMap((purse) => purse.value);
  ownedItems && itemDispatch({ type: "SET_OWNED_ITEMS", payload: ownedItems });
  equippedCharacterItems && itemDispatch({ type: "SET_EQUIPPED_ITEMS", payload: equippedCharacterItems });
  itemDispatch({ type: "SET_FETCHED", payload: true });

  console.info(`👤 Found ${ownedCharacters.length} characters.`);
  console.info(`📦 Found ${ownedItems.length} Items.`);
  console.info("👛 Money Purse Info: ", newTokenPurses[0].displayInfo);
  console.info("👛 Money Purse Petname: ", newTokenPurses[0].brandPetname);
  console.info("👛 Character Purse Info: ", newCharacterPurses[0].displayInfo);
  console.info("👛 Character Purse Petname: ", newCharacterPurses[0].brandPetname);
  console.info("👛 Item Purse Info: ", newItemPurses[0].displayInfo);
  console.info("👛 Item Purse Petname: ", newItemPurses[0].brandPetname);
};
