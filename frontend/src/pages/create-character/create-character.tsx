import { FC, useState } from "react";

import { DefaultIcon, text } from "../../assets";
import { ErrorView, FormHeader } from "../../components";
import { PageContainer } from "../../components/page-container";
import { PAYMENT_STEP } from "../../constants";
import { useViewport } from "../../hooks";
import { CharacterCreation } from "../../interfaces";
import { useCreateCharacter } from "../../service";
import { Information } from "./information";
import { Payment } from "./payment";
import { DefaultImage, FormCard } from "./styles";

export const CreateCharacter: FC = () => {
  const { width, height } = useViewport();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const createCharacter = useCreateCharacter();

  const changeStep = (step: number): void => {
    setCurrentStep(step);
  };

  const submitForm = (data: CharacterCreation): void => {
    createCharacter.mutate(data);
    if (createCharacter.isSuccess) setCurrentStep(PAYMENT_STEP);
  };

  if (createCharacter.isError) return <ErrorView />;

  const perStepDisplay = (): React.ReactNode => {
    switch (currentStep) {
    case 0:
      return <Information submitForm={submitForm} disabled={createCharacter.isLoading} />;
    case 1:
      return <Payment changeStep={changeStep} />;
    case 2:
      return <></>;
    default:
      return <Information submitForm={submitForm} disabled={createCharacter.isLoading} />;
    }
  };

  return (
    <PageContainer
      mainContent={
        <DefaultImage
          src={DefaultIcon}
          alt={text.character.defaultCharacter}
          height={height}
          width={width}
        />}
      sidebarContent={
        <FormCard height={height} width={width}>
          <FormHeader currentStep={currentStep} />
          <>{perStepDisplay()}</>
        </FormCard>
      }
    />
  );
};
