import { FC, useState } from "react";
import { text } from "../../assets";

import {  Badge, ButtonText, FormText, PriceInRun, PrimaryButton } from "../../components";
import { CONFIRMATION_STEP } from "../../constants";
import { color } from "../../design";
import { Item } from "../../interfaces";
import { ArrowUp, ButtonContainer, ContentWrapper, Line, NumberContainer, Step, StepContainer, StepText, Tick, } from "./styles";

interface BuyFormProps {
  item: Item;
  changeStep: (step: number) => void;
}

export const BuyForm: FC<BuyFormProps> = ({ item, changeStep }) => {
  const [sendOffer, setSendOffer] = useState(false);
  const [acceptOffer, setAcceptOffer] = useState(false);

  const sendOfferToWallet = () => {
    // TODO: send offer
    setSendOffer(true);
  };

  const acceptOfferInWallet = () => {
    // TODO: send accept
    setAcceptOffer(true);
  };


  return (
    <ContentWrapper>
      <FormText>{text.mint.theCostsOfMinting}</FormText>
      <StepContainer>
        <Step>
          <NumberContainer active >
            {sendOffer ?
              <Tick />
              :
              <ButtonText>{text.mint.stepOne}</ButtonText>
            }
          </NumberContainer>
          <StepText>{text.mint.sendOfferToWallet}</StepText>
          {!sendOffer && (
            <>
              <PriceInRun price={item.price} />
              <PrimaryButton onClick={() => sendOfferToWallet()}>
                <ButtonText customColor={color.white}>{text.mint.sendOffer}</ButtonText>
              </PrimaryButton>
            </>
          )}
        </Step>
        <Line />
        <Step>
          <NumberContainer active={!!sendOffer}>
            {acceptOffer ? <Tick /> :<ButtonText>{text.mint.stepTwo}</ButtonText>}
          </NumberContainer>
          <StepText>{text.mint.acceptOfferIn}</StepText>
          {!acceptOffer && !!sendOffer && (
            // TODO: remove this onclick
            <Badge onClick={() => acceptOfferInWallet()}>
              <ButtonText customColor={color.darkGrey}>{text.mint.offerPending}</ButtonText>
            </Badge>
          )}
        </Step>
      </StepContainer>
      <ButtonContainer>
        <PrimaryButton onClick={()=>changeStep(CONFIRMATION_STEP)} disabled={!acceptOffer}>
          <ButtonText customColor={color.white}>{text.mint.confirm}</ButtonText>
          <ArrowUp />
        </PrimaryButton>
      </ButtonContainer>
    </ContentWrapper>
  );
};
