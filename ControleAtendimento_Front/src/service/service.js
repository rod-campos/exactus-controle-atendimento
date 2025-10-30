import axios from "axios";

const baseUrl = "http://localhost:5216/api";

const token = localStorage.getItem("token");

export const GetUsuarios = async () => {
  try {
    const response = await axios.get(`${baseUrl}/Usuario?page=1&pageSize=20`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const UsuarioLogin = async (usuario) => {
  try {
    const response = await axios.post(`${baseUrl}/Usuario/login`, {
      email: usuario.email,
      senha: usuario.password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const UsuarioLogout = async () => {
  try {
    const response = await axios.post(
      `${baseUrl}/Usuario/logout`,
      {},
      { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
    );
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    return response.data;
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    throw error;
  }
};

export const UsuarioCreate = async (usuario) => {
  try {
    const response = await axios.post(
      `${baseUrl}/Usuario`,
      {
        nomeUsuario: usuario.nomeUsuario,
        telefone: usuario.telefone,
        email: usuario.email,
        senha: usuario.senha,
        cargo: usuario.cargo,
        isAdmin: usuario.isAdmin,
      },
      { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const EditarUsuario = async (id, usuario) => {
  try {
    const response = await axios.put(
      `${baseUrl}/Usuario/${id}`,
      {
        nomeUsuario: usuario.nomeUsuario,
        telefone: usuario.telefone,
        email: usuario.email,
        cargo: usuario.cargo,
        isAdmin: usuario.isAdmin,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const ReativarUsuario = async (id) => {
  try {
    const response = await axios.patch(
      `${baseUrl}/Usuario/${id}/reactivate`,
      {},
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const AlterarSenhaUsuario = async (id, novaSenha) => {
  try {
    const response = await axios.put(
      `${baseUrl}/Usuario/${id}/password`,
      JSON.stringify(novaSenha),
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const DeletarUsuario = async (id) => {
  try {
    const response = await axios.delete(`${baseUrl}/Usuario/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const InformacoesUsuario = async () => {
  try {
    const response = await axios.get(`${baseUrl}/Usuario/me`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const Atendimentos = async (
  page = 1,
  pageSize = 20,
  dataInicio = null,
  dataFim = null,
  search = null
) => {
  try {
    let url = `${baseUrl}/Atendimento?page=${page}&pageSize=${pageSize}`;
    if (dataInicio) {
      url += `&dataInicio=${dataInicio}`;
    }
    if (dataFim) {
      url += `&dataFim=${dataFim}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await axios.get(url, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const CadastrarAtendimento = async (atendimento) => {
  try {
    const response = await axios.post(
      `${baseUrl}/Atendimento`,
      {
        caId: Number(atendimento.caId),
        clienteId: Number(atendimento.clienteId),
        moduloId: Number(atendimento.moduloId),
        assuntoId: Number(atendimento.assuntoId),
        tipoAtendimentoId: Number(atendimento.tipoAtendimentoId),
        titulo: atendimento.titulo,
        descricao: atendimento.descricao,
        prioridade: Number(atendimento.prioridade),
        usuarioId: Number(atendimento.usuarioId),
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const EditarAtendimento = async (id, atendimento) => {
  try {
    const response = await axios.put(
      `${baseUrl}/Atendimento/${id}`,
      {
        caId: Number(atendimento.caId),
        clienteId: Number(atendimento.clienteId),
        moduloId: Number(atendimento.moduloId),
        assuntoId: Number(atendimento.assuntoId),
        tipoAtendimentoId: Number(atendimento.tipoAtendimentoId),
        titulo: atendimento.titulo,
        descricao: atendimento.descricao,
        prioridade: Number(atendimento.prioridade),
        dataInicio: atendimento.dataInicio,
        dataFim: atendimento.dataFim,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const FinalizarAtendimento = async (id, atendimento) => {
  try {
    const response = await axios.put(
      `${baseUrl}/Atendimento/${id}`,
      {
        titulo: atendimento.titulo,
        descricao: atendimento.descricao,
        solucao: atendimento.solucao || "",
        prioridade: Number(atendimento.prioridade),
        observacoes: atendimento.observacoes || "",
        usuarioId: Number(atendimento.usuarioId),
        statusId: Number(atendimento.statusId),
        moduloId: Number(atendimento.moduloId),
        dataFim: new Date().toISOString(),
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const DeletarAtendimento = async (id) => {
  try {
    const response = await axios.delete(`${baseUrl}/Atendimento/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const Clientes = async () => {
  try {
    const response = await axios.get(`${baseUrl}/Cliente?page=1&pageSize=20`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const ClientePorCa = async (caId) => {
  try {
    const response = await axios.get(`${baseUrl}/Cliente?caId=${caId}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const CadastrarCliente = async (cliente) => {
  try {
    const response = await axios.post(
      `${baseUrl}/Cliente`,
      {
        codigoCliente: cliente.codigoCliente,
        caId: Number(cliente.caId),
        nomeCliente: cliente.nomeCliente,
        razaoSocial: cliente.razaoSocial,
        cnpjCpf: cliente.cnpjCpf,
        cidade: cliente.cidade,
        uf: cliente.uf,
        telefone: cliente.telefone,
        email: cliente.email,
        responsavel: cliente.responsavel,
        statusCliente: cliente.statusCliente,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const EditarCliente = async (id, cliente) => {
  try {
    const response = await axios.put(
      `${baseUrl}/Cliente/${id}`,
      {
        codigoCliente: cliente.codigoCliente,
        caId: Number(cliente.caId),
        nomeCliente: cliente.nomeCliente,
        razaoSocial: cliente.razaoSocial,
        cnpjCpf: cliente.cnpjCpf,
        cidade: cliente.cidade,
        uf: cliente.uf,
        telefone: cliente.telefone,
        email: cliente.email,
        responsavel: cliente.responsavel,
        statusCliente: cliente.statusCliente,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const DeletarCliente = async (id) => {
  try {
    const response = await axios.delete(`${baseUrl}/Cliente/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const Cas = async () => {
  try {
    const response = await axios.get(`${baseUrl}/Ca?page=1&pageSize=20`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const CadastrarCa = async (ca) => {
  try {
    const response = await axios.post(
      `${baseUrl}/Ca`,
      {
        codigoCa: ca.codigoCa,
        nomeCa: ca.nomeCa,
        cnpj: ca.cnpj,
        cidade: ca.cidade,
        uf: ca.uf,
        telefone: ca.telefone,
        email: ca.email,
        responsavel: ca.responsavel,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const EditarCa = async (id, ca) => {
  try {
    const response = await axios.put(
      `${baseUrl}/Ca/${id}`,
      {
        codigoCa: ca.codigoCa,
        nomeCa: ca.nomeCa,
        cnpj: ca.cnpj,
        cidade: ca.cidade,
        uf: ca.uf,
        telefone: ca.telefone,
        email: ca.email,
        responsavel: ca.responsavel,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const DeletarCa = async (id) => {
  try {
    const response = await axios.delete(`${baseUrl}/Ca/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const Modulos = async () => {
  try {
    const response = await axios.get(`${baseUrl}/Modulo?page=1&pageSize=20`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const CadastrarModulo = async (modulo) => {
  try {
    const response = await axios.post(
      `${baseUrl}/Modulo`,
      {
        nomeModulo: modulo.nomeModulo,
        descricao: modulo.descricao,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const EditarModulo = async (id, modulo) => {
  try {
    const response = await axios.put(
      `${baseUrl}/Modulo/${id}`,
      {
        nomeModulo: modulo.nomeModulo,
        descricao: modulo.descricao,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const DeletarModulo = async (id) => {
  try {
    const response = await axios.delete(`${baseUrl}/Modulo/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const Assuntos = async () => {
  try {
    const response = await axios.get(`${baseUrl}/Assunto?page=1&pageSize=20`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const CadastrarAssunto = async (assunto) => {
  try {
    const response = await axios.post(
      `${baseUrl}/Assunto`,
      {
        tipoAssunto: assunto.tipoAssunto,
        moduloId: Number(assunto.moduloId),
        descricao: assunto.descricao,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const EditarAssunto = async (id, assunto) => {
  try {
    const response = await axios.put(
      `${baseUrl}/Assunto/${id}`,
      {
        tipoAssunto: assunto.tipoAssunto,
        moduloId: Number(assunto.moduloId),
        descricao: assunto.descricao,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const DeletarAssunto = async (id) => {
  try {
    const response = await axios.delete(`${baseUrl}/Assunto/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const TipoAtendimentos = async () => {
  try {
    const response = await axios.get(
      `${baseUrl}/TipoAtendimento?page=1&pageSize=20`,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const CadastrarTipoAtendimento = async (tipoAtendimento) => {
  try {
    const response = await axios.post(
      `${baseUrl}/TipoAtendimento`,
      {
        nome: tipoAtendimento.nome,
        descricao: tipoAtendimento.descricao,
        prioridade: Number(tipoAtendimento.prioridade),
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const EditarTipoAtendimento = async (id, tipoAtendimento) => {
  try {
    const response = await axios.put(
      `${baseUrl}/TipoAtendimento/${id}`,
      {
        nome: tipoAtendimento.nome,
        descricao: tipoAtendimento.descricao,
        prioridade: Number(tipoAtendimento.prioridade),
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const DeletarTipoAtendimento = async (id) => {
  try {
    const response = await axios.delete(`${baseUrl}/TipoAtendimento/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const EnviarSugestao = async (sugestao) => {
  try {
    const response = await axios.post(
      `${baseUrl}/Sugestao`,
      {
        titulo: sugestao.titulo,
        conteudo: sugestao.conteudo,
        clienteId: Number(sugestao.clienteId),
        caId: Number(sugestao.caId),
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const Sugestoes = async () => {
  try {
    const response = await axios.get(`${baseUrl}/Sugestao?page=1&pageSize=50`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const MarcarSugestaoComoLida = async (id) => {
  try {
    const response = await axios.patch(`${baseUrl}/Sugestao/${id}/read`, true, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const DeletarSugestao = async (id) => {
  try {
    const response = await axios.delete(`${baseUrl}/Sugestao/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
