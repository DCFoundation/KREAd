import { FC, ReactNode, useState } from "react";

import { text } from "../../assets";
import {
  CharacterShopCard,
  Filters,
  HorizontalDivider,
  Label,
  LoadingPage,
  OverviewEmpty,
  Overlay,
  PriceSelector,
  Select,
  ButtonText,
} from "../../components";
import { MAX_PRICE, MIN_PRICE } from "../../constants";
import { color } from "../../design";
import { useViewport } from "../../hooks";
import { useFilteredCharacters } from "../../service";
import { characterCategories, sorting } from "../../assets/text/filter-options";
import {
  FilterContainer,
  FilterWrapper,
  ItemContainer,
  ItemWrapper,
  SelectorContainer,
  SortByContainer,
} from "./styles";
import { Character } from "../../interfaces";
import { CharacterDetailSection } from "../../containers/detail-section";
import { useNavigate } from "react-router-dom";
import { routes } from "../../navigation";

interface Props {
  pageSelector: ReactNode;
}

export const CharactersShop: FC<Props> = ({ pageSelector }) => {
  const { height } = useViewport();
  const navigate = useNavigate();

  const [selectedCharacter, setSelectedCharacter] = useState<Character>();
  const [close, setClose] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSorting, setSelectedSorting] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<{ min: number; max: number }>({ min: MIN_PRICE, max: MAX_PRICE });

  const { data: characters, isLoading: isLoading } = useFilteredCharacters(selectedCategory, selectedSorting, selectedPrice);

  const noFilteredCharacters =
    (!selectedCategory.length || !selectedSorting.length || !selectedPrice) && (!characters || !characters.length);

  const handlePriceChange = (min: number, max: number) => {
    setSelectedPrice({ min: min, max: max });
  };

  const buy = () => {
    if (!selectedCharacter) return;
    navigate(`${routes.buyCharacter}/${selectedCharacter.characterId}`);
  };

  if (isLoading) return <LoadingPage />;

  return (
    <>
      <FilterWrapper>
        <FilterContainer tabIndex={0} onBlur={() => setClose(false)}>
          <SelectorContainer>
            {pageSelector}
            <Filters label={text.filters.category} close>
              <Select label={text.filters.allCategories} handleChange={setSelectedCategory} options={characterCategories} />
            </Filters>
            {/* TODO: get actual min and max values */}
            <Filters label={text.filters.price} close={close}>
              <PriceSelector handleChange={handlePriceChange} min={MIN_PRICE} max={MAX_PRICE} />
            </Filters>
          </SelectorContainer>

          <SortByContainer>
            <Label customColor={color.black}>{text.filters.sortBy}</Label>
            <Filters label={text.filters.latest} close={close}>
              <Select label={text.filters.latest} handleChange={setSelectedSorting} options={sorting} />
            </Filters>
          </SortByContainer>
        </FilterContainer>
        <ButtonText customColor={color.darkGrey}>{text.param.amountOfCharacters(!characters ? 0 : characters.length)}</ButtonText>
        <HorizontalDivider />
      </FilterWrapper>
      {!characters || !characters.length ? (
        <OverviewEmpty
          headingText={text.store.thereAreNoCharactersInTheShop}
          descriptionText={text.store.thereAreNoCharactersAvailable}
          buttonText={text.navigation.goHome}
          redirectRoute={routes.character}
        />
      ) : (
        <>
          {noFilteredCharacters || (
            <ItemWrapper height={height}>
              <ItemContainer>
                {characters.map((character, index) => (
                  <CharacterShopCard character={character} key={index} onClick={setSelectedCharacter} />
                ))}
              </ItemContainer>
            </ItemWrapper>
          )}
          {noFilteredCharacters || (
            <ItemWrapper height={height}>
              <ItemContainer>
                {characters.map((character, index) => (
                  <CharacterShopCard character={character} key={index} onClick={setSelectedCharacter} />
                ))}
              </ItemContainer>
            </ItemWrapper>
          )}
        </>
      )}
      {!!selectedCharacter && (
        <CharacterDetailSection
          character={selectedCharacter}
          actions={{ onClose: () => setSelectedCharacter(undefined), primary: { text: text.item.buy, onClick: buy } }}
        />
      )}
      {!!selectedCharacter && <Overlay />}
    </>
  );
};
