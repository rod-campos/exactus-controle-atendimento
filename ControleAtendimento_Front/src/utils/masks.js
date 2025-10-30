export const maskPhone = (value) => {
  const cleanValue = value.replace(/\D/g, "");

  const truncatedValue = cleanValue.slice(0, 11);

  if (truncatedValue.length === 0) {
    return "";
  } else if (truncatedValue.length === 1) {
    return `(${truncatedValue}`;
  } else if (truncatedValue.length <= 2) {
    return `(${truncatedValue}`;
  } else if (truncatedValue.length <= 7) {
    return `(${truncatedValue.slice(0, 2)}) ${truncatedValue.slice(2)}`;
  } else {
    return `(${truncatedValue.slice(0, 2)}) ${truncatedValue.slice(
      2,
      7
    )}-${truncatedValue.slice(7)}`;
  }
};

export const maskDate = (value) => {
  const cleanValue = value.replace(/\D/g, "").slice(0, 8);

  if (cleanValue.length === 0) {
    return "";
  } else if (cleanValue.length <= 2) {
    return cleanValue;
  } else if (cleanValue.length <= 4) {
    return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
  } else {
    return `${cleanValue.slice(0, 2)}/${cleanValue.slice(
      2,
      4
    )}/${cleanValue.slice(4)}`;
  }
};

export const convertDateToISO = (dateBR) => {
  // Converte data do formato DD/MM/YYYY para YYYY-MM-DD
  if (!dateBR || dateBR.length !== 10) {
    return null;
  }

  const cleanValue = dateBR.replace(/\D/g, "");
  if (cleanValue.length !== 8) {
    return null;
  }

  const day = cleanValue.slice(0, 2);
  const month = cleanValue.slice(2, 4);
  const year = cleanValue.slice(4, 8);

  return `${year}-${month}-${day}`;
};

export const maskCpfCnpj = (value) => {
  const cleanValue = value.replace(/\D/g, "");

  // Limita a 14 dígitos (tamanho do CNPJ)
  const truncatedValue = cleanValue.slice(0, 14);

  if (truncatedValue.length === 0) {
    return "";
  } else if (truncatedValue.length <= 11) {
    // Formata como CPF: 000.000.000-00
    if (truncatedValue.length <= 3) {
      return truncatedValue;
    } else if (truncatedValue.length <= 6) {
      return `${truncatedValue.slice(0, 3)}.${truncatedValue.slice(3)}`;
    } else if (truncatedValue.length <= 9) {
      return `${truncatedValue.slice(0, 3)}.${truncatedValue.slice(
        3,
        6
      )}.${truncatedValue.slice(6)}`;
    } else {
      return `${truncatedValue.slice(0, 3)}.${truncatedValue.slice(
        3,
        6
      )}.${truncatedValue.slice(6, 9)}-${truncatedValue.slice(9)}`;
    }
  } else {
    // Formata como CNPJ: 00.000.000/0000-00
    if (truncatedValue.length <= 2) {
      return truncatedValue;
    } else if (truncatedValue.length <= 5) {
      return `${truncatedValue.slice(0, 2)}.${truncatedValue.slice(2)}`;
    } else if (truncatedValue.length <= 8) {
      return `${truncatedValue.slice(0, 2)}.${truncatedValue.slice(
        2,
        5
      )}.${truncatedValue.slice(5)}`;
    } else if (truncatedValue.length <= 12) {
      return `${truncatedValue.slice(0, 2)}.${truncatedValue.slice(
        2,
        5
      )}.${truncatedValue.slice(5, 8)}/${truncatedValue.slice(8)}`;
    } else {
      return `${truncatedValue.slice(0, 2)}.${truncatedValue.slice(
        2,
        5
      )}.${truncatedValue.slice(5, 8)}/${truncatedValue.slice(
        8,
        12
      )}-${truncatedValue.slice(12)}`;
    }
  }
};

export const maskCNPJ = (value) => {
  const cleanValue = value.replace(/\D/g, "");
  const truncatedValue = cleanValue.slice(0, 14);

  if (truncatedValue.length === 0) {
    return "";
  } else if (truncatedValue.length <= 2) {
    return truncatedValue;
  } else if (truncatedValue.length <= 5) {
    return `${truncatedValue.slice(0, 2)}.${truncatedValue.slice(2)}`;
  } else if (truncatedValue.length <= 8) {
    return `${truncatedValue.slice(0, 2)}.${truncatedValue.slice(
      2,
      5
    )}.${truncatedValue.slice(5)}`;
  } else if (truncatedValue.length <= 12) {
    return `${truncatedValue.slice(0, 2)}.${truncatedValue.slice(
      2,
      5
    )}.${truncatedValue.slice(5, 8)}/${truncatedValue.slice(8)}`;
  } else {
    return `${truncatedValue.slice(0, 2)}.${truncatedValue.slice(
      2,
      5
    )}.${truncatedValue.slice(5, 8)}/${truncatedValue.slice(
      8,
      12
    )}-${truncatedValue.slice(12)}`;
  }
};
