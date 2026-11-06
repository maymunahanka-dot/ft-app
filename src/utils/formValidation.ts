/**
 * Form validation utilities.
 * Mandatory fields are required; optional fields are validated only when present.
 */

type ValidationResult<T extends string = string> = {
  isValid: boolean;
  errors: Record<T, string>;
};

/** Design form shape (create-design) */
type DesignFormData = {
  imageUrl: string;
  name: string;
  price: string;
  description: string;
  notes: string;
};

/**
 * Validates design form. Mandatory: imageUrl, name, price (must be valid number > 0).
 * Optional: description, notes (no validation).
 */
export function validateDesignForm(data: DesignFormData): ValidationResult<keyof DesignFormData> {
  const errors: Record<keyof DesignFormData, string> = {
    imageUrl: "",
    name: "",
    price: "",
    description: "",
    notes: "",
  };

  let isValid = true;

  if (!data.imageUrl?.trim()) {
    errors.imageUrl = "Design image is required";
    isValid = false;
  }

  if (!data.name?.trim()) {
    errors.name = "Design name is required";
    isValid = false;
  }

  if (!data.price?.trim()) {
    errors.price = "Price is required";
    isValid = false;
  } else {
    const num = parseFloat(data.price.replace(/[^0-9.]/g, ""));
    if (Number.isNaN(num) || num <= 0) {
      errors.price = "Enter a valid price (greater than 0)";
      isValid = false;
    }
  }

  return { isValid, errors };
}




