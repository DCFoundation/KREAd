import { FC, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { text } from "../../assets";
import { ErrorView, FadeInOut, LoadingPage } from "../../components";
import { PageContainer } from "../../components/page-container";
import { CharactersList } from "../../containers/characters-list";
import { CharacterDetailSection } from "../../containers/detail-section";
import { Character } from "../../interfaces";
import { routes } from "../../navigation";
import { useMyCharacters } from "../../service";
import { DetailWrapper } from "./styles";

export const CharactersInventory: FC = () => {
  const navigate = useNavigate();
  const [{ owned: myCharacters, isLoading: isLoadingCharacters }] = useMyCharacters();
  const [selectedId, setSelectedId] = useState<string>("");

  const character = useMemo(() => myCharacters?.find((character: Character) => character.id === selectedId), [myCharacters, selectedId]);

  const choose = () => {
    // TODO: implement character choose
    console.log("TODO: implement character choose");
  };

  // TODO: Move to Character service
  const sell = () => {
    if (!selectedId) return;
    navigate(`${routes.sellCharacter}/${selectedId}`);
  };

  if (isLoadingCharacters) return <LoadingPage />;

  if (!myCharacters || !myCharacters.length) return <ErrorView />;

  return (
    <PageContainer sidebarContent={<CharactersList onCharacterClick={setSelectedId} />}>
      <FadeInOut show={true} exiting={false}>
        <DetailWrapper>
          <CharacterDetailSection
            character={character || myCharacters[0]}
            actions={{
              primary: { text: text.character.choose, onClick: choose },
              secondary: { text: text.character.sell, onClick: sell },
            }}
          />
        </DetailWrapper>
      </FadeInOut>
    </PageContainer>
  );
};
