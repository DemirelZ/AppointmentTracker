// Email validation
export const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (supports international formats)
export const validatePhone = phone => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');

  // Check if phone has at least 10 digits
  if (cleanPhone.length < 10) {
    return false;
  }

  // Check if phone has reasonable length (max 15 digits)
  if (cleanPhone.length > 15) {
    return false;
  }

  return true;
};

// Name validation
export const validateName = name => {
  if (!name || name.trim().length === 0) {
    return false;
  }

  // Check if name has at least 2 characters
  if (name.trim().length < 2) {
    return false;
  }

  // Check if name contains only letters, spaces, and common name characters
  const nameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s'-]+$/;
  return nameRegex.test(name.trim());
};

// Title validation
export const validateTitle = title => {
  if (!title || title.trim().length === 0) {
    return false;
  }

  // Check if title has at least 3 characters
  if (title.trim().length < 3) {
    return false;
  }

  // Check if title is not too long (max 100 characters)
  if (title.trim().length > 100) {
    return false;
  }

  return true;
};

// Date validation
export const validateDate = date => {
  if (!date) {
    return false;
  }

  const selectedDate = new Date(date);
  const now = new Date();

  // Check if date is valid
  if (isNaN(selectedDate.getTime())) {
    return false;
  }

  // Check if date is not in the past (for appointments)
  if (selectedDate < now) {
    return false;
  }

  return true;
};

// Description validation
export const validateDescription = description => {
  if (!description) {
    return true; // Description is optional
  }

  // Check if description is not too long (max 500 characters)
  if (description.length > 500) {
    return false;
  }

  return true;
};

// Get validation error message
export const getValidationErrorMessage = (field, value) => {
  switch (field) {
    case 'name':
      if (!value || value.trim().length === 0) {
        return 'Name field cannot be empty';
      }
      if (value.trim().length < 2) {
        return 'Name must be at least 2 characters';
      }
      if (!validateName(value)) {
        return 'Name can only contain letters, spaces and special characters';
      }
      break;

    case 'email':
      if (value && !validateEmail(value)) {
        return 'Please enter a valid email address';
      }
      break;

    case 'phone':
      if (value && !validatePhone(value)) {
        return 'Please enter a valid phone number (at least 10 digits)';
      }
      break;

    case 'title':
      if (!value || value.trim().length === 0) {
        return 'Title field cannot be empty';
      }
      if (value.trim().length < 3) {
        return 'Title must be at least 3 characters';
      }
      if (value.trim().length > 100) {
        return 'Title cannot exceed 100 characters';
      }
      break;

    case 'date':
      if (!value) {
        return 'Please select a date';
      }
      if (!validateDate(value)) {
        return 'Cannot select a past date';
      }
      break;

    case 'description':
      if (value && value.length > 500) {
        return 'Description cannot exceed 500 characters';
      }
      break;

    default:
      return 'Invalid field';
  }

  return null;
};
