// Este arquivo contém funções de validação reutilizáveis
// As funções de autenticação foram movidas para AuthContext.jsx

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  // Mínimo 6 caracteres
  return password.length >= 6;
};

export const validatePhone = (phone) => {
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, "");
  // Verifica se tem 10 ou 11 dígitos (com ou sem DDD)
  return cleaned.length >= 10 && cleaned.length <= 11;
};
