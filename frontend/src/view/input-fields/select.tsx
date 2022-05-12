import { FC } from 'react';
import { ButtonBase } from '../atoms';

// TODO: replace @mui components
// import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
import { FormBox, Label, SelectArrow, StyledSelect } from "./styles";


interface Options {
  label: string;
  value: string;
};

interface SelectProps {
  label: string;
  input: string;
  handleChange: (event: any) => void;
  options: Options[];
};

export const Select: FC<SelectProps> = ({ label, input, options, handleChange }) => {
  return (
    <FormBox>
      {/* <FormControl fullWidth> */}
        <Label>{label}</Label>
        <StyledSelect
          value={input}
          // label={label}
          onChange={handleChange}
          // IconC omponent={(props: any) => (<SelectArrow {...props} />)}
        >
          {/* used to be @mui/material/MenuItem /*/ }
          {options.map((option) => (
            <ButtonBase value={option.value} key={option.value}>{option.label}</ButtonBase> 
          ))}
        </StyledSelect>
      {/* </FormControl> */}
    </FormBox>
  );
}
