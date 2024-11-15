// src/components/atoms/PhoneInputField/PhoneInputField.tsx
import React from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import './PhoneInputField.module.css'

interface PhoneInputFieldProps {
  value: string
  onChange: (phone: string) => void
  disabled?: boolean
  error?: boolean
}

const PREFERRED_COUNTRIES = ['ar', 'br', 'cl', 'uy', 'py', 'bo', 'pe', 'ec', 'co', 've']

export const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  value,
  onChange,
  disabled = false,
  error = false,
}) => {
  return (
    <PhoneInput
      country="ar"
      value={value}
      onChange={onChange}
      disabled={disabled}
      inputProps={{
        required: true,
        'aria-invalid': error,
      }}
      preferredCountries={PREFERRED_COUNTRIES}
    />
  )
}