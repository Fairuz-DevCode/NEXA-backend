export const validateRegisterInput = ({
  name,
  email,
  password,
}) => {
  if (!name || !email || !password) {
    return "please provide all required field ";
  }
  return null;
};

export const validateLoginInput = ({ email, password }) => {
  if (!email || !password) {
    return "please provide all required field";
  }
  return null;
};
