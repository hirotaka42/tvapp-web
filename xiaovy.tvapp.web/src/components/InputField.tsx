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
    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
  />
);

export default InputField;