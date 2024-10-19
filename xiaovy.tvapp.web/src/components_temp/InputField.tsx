import React, { ChangeEvent } from 'react';

interface InputFieldProps {
  name: string;
  value: string;
  type?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  value,
  type = "text",
  onChange,
  placeholder
}) => (
  <input 
    name={name}
    value={value} 
    type={type}
    onChange={onChange}
    placeholder={placeholder} 
  />
);

export default InputField;