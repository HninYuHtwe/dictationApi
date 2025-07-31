exports.validateInput = (requestData, requiredFields = []) => {
  const errors = [];
  requiredFields.map((field) => {
    if (!requestData[field]) {
      errors.push(field);
    }
  });

  return {
    errorMsg:
      errors.length > 0
        ? `This fields [${errors.join(', ')}] are required.`
        : '',
    isValid: errors.length === 0,
  };
};
