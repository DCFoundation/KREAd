import { FC } from "react";
import { ElephiaCitizen, text } from "../../assets";
import { ButtonText, HorizontalDivider, MenuText, PrimaryButton } from "../../components";
import { PageContainer } from "../../components/page-container";
import { useIsMobile, useViewport } from "../../hooks";
import { ArrowUp, BodyText, ButtonContainer, ButtonWrapper, DefaultImage, FormCard } from "./styles";
import { breakpoints } from "../../design";

export const SunsetKread: FC = () => {
  const { width, height } = useViewport();
  const mobile = useIsMobile(breakpoints.desktop);


  return (
    <PageContainer
      sidebarContent={
        <FormCard>
          <MenuText>{text.general.sunsetTitle}</MenuText>
          <HorizontalDivider/>
          <BodyText>{text.general.sunsetText}</BodyText>
          <ButtonWrapper>
            <ButtonContainer>
              <PrimaryButton type="submit">
                <ButtonText customColor="#FFFFFF">{"Navigate Somewhere"}</ButtonText>
                <ArrowUp />
              </PrimaryButton>
            </ButtonContainer>
          </ButtonWrapper>
        </FormCard>
      }
    >
      
      {!mobile && <DefaultImage src={ElephiaCitizen} alt={text.character.defaultCharacter} height={height} width={width} />}
    </PageContainer>
  );
};
