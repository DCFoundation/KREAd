import { AgoricDispatch } from "../../interfaces/agoric.interfaces";
import { CharacterDispatch } from "../../interfaces/character-actions.interfaces";
import { ItemDispatch } from "../../interfaces/item-actions.interfaces";

export const processPurses = (purses: any[], characterDispatch: CharacterDispatch, serviceDispatch: AgoricDispatch, brandsToCheck: { money: string, character: string, item: string}) => {
  const newTokenPurses = purses.filter(
    ({ brandBoardId }) => brandBoardId === brandsToCheck.money,
  );
  const newCharacterPurses = purses.filter(
    ({ brandBoardId }) => brandBoardId === brandsToCheck.character // || brandBoardId === CHARACTER_ZFC_BRAND_BOARD_ID,
  );
  const newItemPurses = purses.filter(
    ({ brandBoardId }) => brandBoardId === brandsToCheck.item // || brandBoardId === CHARACTER_ZFC_BRAND_BOARD_ID,
  );
  serviceDispatch({ type: "SET_TOKEN_PURSES", payload: newTokenPurses });
  serviceDispatch({ type: "SET_CHARACTER_PURSES", payload: newCharacterPurses });
  serviceDispatch({ type: "SET_ITEM_PURSES", payload: newItemPurses });

  const ownedCharacters = newCharacterPurses.flatMap((purse) => {
    return purse.value;
  });

  const ownedItems = newItemPurses.flatMap((purse) => {
    return purse.value;
  });

  characterDispatch({ type: "SET_OWNED_CHARACTERS", payload: ownedCharacters });
  itemDispatch({ type: "SET_OWNED_ITEMS", payload: ownedItems });

  console.info(`👤 Found ${ownedCharacters.length} characters.`);
  console.info(`📦 Found ${ownedItems.length} Items.`);
  console.info("👛 Money Purse Info: ", newTokenPurses[0].displayInfo);
  console.info("👛 Money Purse Petname: ", newTokenPurses[0].brandPetname);
  console.info("👛 Character Purse Info: ", newCharacterPurses[0].displayInfo);
  console.info("👛 Character Purse Petname: ", newCharacterPurses[0].brandPetname);
  console.info("👛 Item Purse Info: ", newItemPurses[0].displayInfo);
  console.info("👛 Item Purse Petname: ", newItemPurses[0].brandPetname);
};
