import { FC } from "react";
import { useNavigate } from "react-router-dom";

import { text } from "../../assets";
import { color } from "../../design";
import { AnimatedLogo, ButtonText, Footer, MenuText, OnboardingCharacter, PrimaryButton, TitleText } from "../../components";
import {
  ArrowDown,
  ArrowUp,
  ButtonContainer,
  ConnectContainer,
  Link,
  TextContainer,
  EndContent,
  FooterContainer,
  GeneralSectionContainer,
  InfoText,
  KreadContainer,
  MiddleContent,
  OnboardingContainer,
  OnboardingWrapper,
  ScrollContainer,
  SectionContainer,
  KryhaLink,
} from "./styles";
import { useViewport } from "../../hooks";
import { routes } from "../../navigation";
import { AGORIC_LINK, KRYHA_LINK } from "../../constants";

export const Onboarding: FC = () => {
  const navigate = useNavigate();
  const { width, height } = useViewport();

  const connectWallet = () => {
    // TODO: check if you have any assets in your wallet & connect to wallet
    navigate(routes.createCharacter);
  };

  return (
    <OnboardingContainer height={height} width={width}>
      <OnboardingWrapper>
        <InfoText height={height}>
          <SectionContainer>
            <MenuText>{text.general.launchingTheFirst}</MenuText>
            <TitleText customColor={color.darkGrey}>{text.general.aCharcterBuilderApp}</TitleText>
            <ButtonContainer>
              <PrimaryButton onClick={() => connectWallet()}>
                <ButtonText customColor={color.white}>{text.general.connectWallet}</ButtonText>
                <ArrowUp />
              </PrimaryButton>
            </ButtonContainer>
          </SectionContainer>
          <ScrollContainer>
            <ButtonText>{text.general.scroll}</ButtonText>
            <ArrowDown />
          </ScrollContainer>
        </InfoText>
        <MiddleContent height={height}>
          <GeneralSectionContainer>
            <ConnectContainer>
              <PrimaryButton onClick={() => connectWallet()}>
                <ButtonText customColor={color.white}>{text.general.connectWallet}</ButtonText>
                <ArrowUp />
              </PrimaryButton>
            </ConnectContainer>
            <MenuText>{text.general.whoWeAre}</MenuText>
            <TextContainer>{text.general.isPartOfAgoric}</TextContainer>
            <Link href={AGORIC_LINK}>{text.param.comma(text.general.agoric)}</Link>
            <TextContainer>{text.general.anOpenSource}</TextContainer>
            <KryhaLink href={KRYHA_LINK}>{text.param.fullstop(text.general.kryha)}</KryhaLink>
            <TextContainer>{text.general.ourLeadership}</TextContainer>
          </GeneralSectionContainer>
        </MiddleContent>
        <EndContent height={height}>
          <GeneralSectionContainer>
            <ConnectContainer>
              <PrimaryButton onClick={() => connectWallet()}>
                <ButtonText customColor={color.white}>{text.general.connectWallet}</ButtonText>
                <ArrowUp />
              </PrimaryButton>
            </ConnectContainer>
            <MenuText>{text.general.contactUs}</MenuText>
            <TitleText customColor={color.darkGrey}>{text.general.questionsBug}</TitleText>
            <TextContainer>{text.general.sendEmailTo}</TextContainer>
            <Link href={`mailto:${text.general.contactEmail}`}>{text.general.contactEmail}</Link>
          </GeneralSectionContainer>
        </EndContent>
      </OnboardingWrapper>
      <OnboardingCharacter />
      <FooterContainer>
        <Footer />
      </FooterContainer>
      <KreadContainer height={height} width={width}>
        <AnimatedLogo iteration={1} />
      </KreadContainer>
    </OnboardingContainer>
  );
};
