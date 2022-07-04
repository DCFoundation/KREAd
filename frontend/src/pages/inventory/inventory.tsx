import { FC, useMemo, useState } from "react";

import { BaseRoute, ErrorView, LoadingPage, NotificationCard, Overlay, OverviewEmpty, SwitchSelector } from "../../components";
import { text } from "../../assets/text";
import { PageContainer } from "../../components/page-container";
import { CharacterDetailSection, ItemDetailSection } from "../../containers/detail-section";
import { Title } from "../../components/title";
import { ItemsList } from "../../containers/items-list";
import { useMyItems, useMyCharacters } from "../../service";
import { CharactersList } from "../../containers/characters-list";
import { routes } from "../../navigation";
import { useNavigate } from "react-router-dom";
import { Page } from "../shop";
import {
  Close,
  InventoryWrapper,
  NotificationButton,
  NotificationWrapper,
  OverviewContainer,
  Notification,
  DetailWrapper,
  NotificationContainer,
  Tag,
} from "./styles";
import { EmptyCard } from "../../components/empty-card";
import { color } from "../../design";
import { Character } from "../../interfaces";

const ItemsInventory: FC = () => {
  const [items, isLoading] = useMyItems();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>("");

  const item = useMemo(() => items?.find((item) => item.id === selectedId), [items, selectedId]);

  // TODO: move to Item service
  const equip = () => {
    // TODO: implement item equip
    console.log("TODO: implement item equip");
  };
  const sell = () => {
    if (!selectedId) return;
    navigate(`${routes.sellItem}/${selectedId}`);
  };

  if (isLoading) return <LoadingPage />;

  // TODO: Implement error handling at servive level
  // if (isError) return <ErrorView />;

  const isEmpty = !items || !items.length;

  return (
    <PageContainer
      sidebarContent={
        isEmpty ? (
          <EmptyCard title={text.item.noItemsInInventory} description={text.item.buyItemsFromStore} />
        ) : (
          <ItemsList onItemClick={setSelectedId} />
        )
      }
    >
      {isEmpty ? (
        <OverviewContainer>
          <OverviewEmpty
            headingText={text.item.noItemEquipped}
            descriptionText={text.item.youDidNotEquip}
            buttonText={text.item.startEquipping}
            onButtonClick={equip}
          />
        </OverviewContainer>
      ) : (
        <ItemDetailSection
          item={item || items[0]}
          actions={{ primary: { text: text.item.equip, onClick: equip }, secondary: { text: text.item.sell, onClick: sell } }}
        />
      )}
    </PageContainer>
  );
};

const CharactersInventory: FC = () => {
  const navigate = useNavigate();
  const [myCharacters, isLoading] = useMyCharacters();
  const [selectedId, setSelectedId] = useState<string>("");

  const character = useMemo(
    () => myCharacters?.find((character: Character) => character.characterId === selectedId),
    [myCharacters, selectedId]
  );

  const choose = () => {
    // TODO: implement character choose
    console.log("TODO: implement character choose");
  };

  // TODO: Move to Character service
  const sell = () => {
    if (!selectedId) return;
    navigate(`${routes.sellCharacter}/${selectedId}`);
  };

  if (isLoading) return <LoadingPage />;

  if (!myCharacters || !myCharacters.length) return <ErrorView />;

  return (
    <PageContainer sidebarContent={<CharactersList onCharacterClick={setSelectedId} />}>
      <DetailWrapper>
        <CharacterDetailSection
          character={character || myCharacters[0]}
          actions={{ primary: { text: text.character.choose, onClick: choose }, secondary: { text: text.character.sell, onClick: sell } }}
        />
      </DetailWrapper>
    </PageContainer>
  );
};

export const Inventory: FC = () => {
  const [selectedPage, setSelectedPage] = useState<Page>(Page.Items);
  const [openNotification, setOpenNotifications] = useState(false);

  const pageSelector = useMemo(
    () => (
      <SwitchSelector
        buttonOneText={text.character.items}
        buttonTwoText={text.character.characters}
        setSelectedIndex={setSelectedPage}
        selectedIndex={selectedPage}
      />
    ),
    [selectedPage]
  );
  // TODO: switch between items and characters
  return (
    <BaseRoute
      sideNavigation={
        <NotificationWrapper>
          <Title title={text.navigation.inventory} />
          <NotificationContainer>
            <NotificationButton
              open={openNotification}
              onClick={() => setOpenNotifications(!openNotification)}
              backgroundColor={openNotification ? color.lightGrey : color.white}
            >
              {openNotification ? <Close /> : <Notification />}
            </NotificationButton>
            <Tag />
          </NotificationContainer>
        </NotificationWrapper>
      }
    >
      <InventoryWrapper>{pageSelector}</InventoryWrapper>
      {selectedPage === Page.Items ? <ItemsInventory /> : <CharactersInventory />}
      {openNotification && (
        <>
          <NotificationCard />
          <Overlay />
        </>
      )}
    </BaseRoute>
  );
};
