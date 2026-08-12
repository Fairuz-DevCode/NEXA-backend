export const validateUpdateUser = (data) => {
  const error = [];

  if(data.name !== undefined && typeof data.name !== 'sting'){
    return 
  }
};