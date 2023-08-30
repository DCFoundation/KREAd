import { FC, ReactNode, useState } from "react";
import { MAX_PRICE, MIN_PRICE, SECTION } from "../../constants";
import { useCharactersMarket, useGetCharacterInShopById } from "../../service";
import { routes } from "../../navigation";
import { AssetFilters } from "../../components/asset-filters/asset-filters";
import { AssetDetails } from "../../components/asset-details/asset-details";
import { AssetCards } from "../../components/asset-cards/asset-cards";
import { OverviewContainer } from "./styles";
import { OverviewEmpty } from "../../components";
import { text } from "../../assets";

interface Props {
  pageSelector: ReactNode;
}

export const CharactersShop: FC<Props> = ({ pageSelector }) => {
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([""]);
  const [selectedSorting, setSelectedSorting] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<{ min: number; max: number }>({ min: MIN_PRICE, max: MAX_PRICE });

  const [characters, isLoading] = useCharactersMarket({
    categories: selectedCategories,
    sort: selectedSorting,
    price: selectedPrice,
  });

  const [character] = useGetCharacterInShopById(selectedId);

  return (
    <>
      <AssetFilters
        pageSelector={pageSelector}
        section={SECTION.SHOP}
        assets={characters}
        selectedCategories={selectedCategories}
        selectedSorting={selectedSorting}
        selectedPrice={selectedPrice}
        setSelectedSorting={setSelectedSorting}
        setSelectedCategories={setSelectedCategories}
        setSelectedPrice={setSelectedPrice}
      />
      <AssetDetails section={SECTION.SHOP} assetData={character} assetId={selectedId} setAssetId={setSelectedId} />
      {characters.length > 0 ? (
        <AssetCards section={SECTION.SHOP} assetsData={characters} isLoading={isLoading} setAssetId={setSelectedId} />
      ) : (
        <OverviewContainer>
          <OverviewEmpty
            headingText={text.store.thereAreNoCharactersInTheShop}
            descriptionText={text.store.thereAreNoCharactersAvailable}
            buttonText={text.navigation.goHome}
            redirectRoute={routes.character}
            secondary
          />
        </OverviewContainer>
      )}
    </>
  );
};
