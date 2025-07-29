
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  return { isValid: true };
};

export const validateForm = (email: string, password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Please enter a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  } else {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid && passwordValidation.message) {
      errors.push(passwordValidation.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
