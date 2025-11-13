import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  form,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
  Tooltip,
  Pagination,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import { mdiPencil, mdiDelete, mdiDotsVertical, mdiCheckCircle } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { maskDate, convertDateToISO } from "../utils/masks";
import {
  Assuntos,
  Atendimentos,
  CadastrarAtendimento,
  Cas,
  Clientes,
  ClientePorCa,
  Modulos,
  TipoAtendimentos,
  EditarAtendimento,
  DeletarAtendimento,
  FinalizarAtendimento,
} from "../service/service";
import { Bottombar } from "../components/Bottombar";
import { ModalSugestao } from "../components/ModalSugestao";
import exactus_logo from "../assets/exactus_logo.svg";

function Home() {
  const usuarioId = JSON.parse(localStorage.getItem("usuario")).id;
  const {
    isOpen: isOpenCriar,
    onOpen: onOpenCriar,
    onClose: onCloseCriar,
    onOpenChange: onOpenChangeCriar,
  } = useDisclosure();
  const {
    isOpen: isOpenEditar,
    onOpen: onOpenEditar,
    onClose: onCloseEditar,
    onOpenChange: onOpenChangeEditar,
  } = useDisclosure();
  const {
    isOpen: isOpenSugestao,
    onOpen: onOpenSugestao,
    onClose: onCloseSugestao,
    onOpenChange: onOpenChangeSugestao,
  } = useDisclosure();
  const {
    isOpen: isOpenVisualizar,
    onOpen: onOpenVisualizar,
    onClose: onCloseVisualizar,
    onOpenChange: onOpenChangeVisualizar,
  } = useDisclosure();
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtrosAtivos, setFiltrosAtivos] = useState({
    dataInicio: null,
    dataFim: null,
    search: null,
  });
  const [formData, setFormData] = useState({
    usuarioId: Number(usuarioId),
  });
  const [editFormData, setEditFormData] = useState({});
  const [selectedAtendimento, setSelectedAtendimento] = useState(null);
  const [cas, setCas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [clientesFiltradosEditar, setClientesFiltradosEditar] = useState([]);
  const [tipoAtendimentos, setTipoAtendimentos] = useState([]);
  const [assuntos, setAssuntos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [atendimentos, setAtendimentos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(10);
  const [termoBusca, setTermoBusca] = useState("");
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [temProximaPagina, setTemProximaPagina] = useState(false);
  const [temPaginaAnterior, setTemPaginaAnterior] = useState(false);

  const fetchCas = async () => {
    try {
      const response = await Cas();
      setCas(response.dados);
      console.log(response);
    } catch (error) {
      console.error("Erro ao buscar CAs:", error);
    }
  };

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const response = await Clientes();
      console.log(response);
      if (response && response.dados) {
        setClientes(response.dados);
      }
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setLoading(false);
    }
  };

  const fetchClientePorCa = async (caId) => {
    try {
      const response = await ClientePorCa(caId);
      console.log("Cliente por CA:", response);
      if (response && response.dados && response.dados.length > 0) {
        setClientesFiltrados(response.dados);
        if (response.dados.length === 1) {
          const cliente = response.dados[0];
          setFormData({
            ...formData,
            caId: caId,
            clienteId: cliente.id.toString(),
          });
        } else {
          setFormData({ ...formData, caId: caId, clienteId: "" });
        }
      } else {
        setClientesFiltrados([]);
        setFormData({ ...formData, caId: caId, clienteId: "" });
      }
    } catch (error) {
      console.error("Erro ao buscar cliente por CA:", error);
      setClientesFiltrados([]);
      setFormData({ ...formData, caId: caId, clienteId: "" });
    }
  };

  const fetchClientePorCaEditar = async (caId) => {
    try {
      const response = await ClientePorCa(caId);
      console.log("Cliente por CA (Editar):", response);
      if (response && response.dados && response.dados.length > 0) {
        setClientesFiltradosEditar(response.dados);
        // Não sobrescreve o editFormData aqui, apenas atualiza a lista de clientes disponíveis
      } else {
        setClientesFiltradosEditar([]);
      }
    } catch (error) {
      console.error("Erro ao buscar cliente por CA (Editar):", error);
      setClientesFiltradosEditar([]);
    }
  };

  const fetchTipoAtendimentos = async () => {
    try {
      const response = await TipoAtendimentos();
      console.log(response);
      setTipoAtendimentos(response.dados);
    } catch (error) {
      console.error("Erro ao buscar tipos de atendimentos:", error);
    }
  };

  const fetchAssuntos = async () => {
    try {
      const response = await Assuntos();
      console.log(response);
      setAssuntos(response.dados);
    } catch (error) {
      console.error("Erro ao buscar assuntos:", error);
    }
  };

  const fetchModulos = async () => {
    try {
      const response = await Modulos();
      setModulos(response.dados);
    } catch (error) {
      console.error("Erro ao buscar módulos:", error);
    }
  };

  const buscarAtendimentos = async (
    pagina = paginaAtual,
    inicio = null,
    fim = null,
    search = null
  ) => {
    try {
      const response = await Atendimentos(
        pagina,
        tamanhoPagina,
        inicio,
        fim,
        search
      );
      console.log(response);
      setAtendimentos(response.dados);
      setPaginaAtual(response.pagina);
      setTotalPaginas(response.totalPaginas);
      setTotalRegistros(response.totalRegistros);
      setTemProximaPagina(response.temProximaPagina);
      setTemPaginaAnterior(response.temPaginaAnterior);
    } catch (error) {
      addToast({
        title: "Erro",
        description: "Erro ao buscar atendimentos",
        color: "danger",
      });
    }
  };

  const handleCreateAtendimento = async () => {
    try {
      await CadastrarAtendimento(formData);
      addToast({
        title: "Sucesso",
        description: "Atendimento criado com sucesso",
        color: "success",
      });
      onCloseCriar();
      buscarAtendimentos();
      setFormData({ usuarioId: Number(usuarioId) });
    } catch (error) {
      addToast({
        title: "Erro",
        description: error.response.data.message,
        color: "danger",
      });
    }
  };

  const handleEditarAtendimento = async (atendimento) => {
    setSelectedAtendimento(atendimento);
    console.log(atendimento);
    await fetchClientePorCaEditar(atendimento.ca.id.toString());
    const formatToDatetimeLocal = (isoDate) => {
      if (!isoDate) return "";
      const date = new Date(isoDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setEditFormData({
      titulo: atendimento.titulo || "",
      caId: atendimento.ca.id.toString(),
      clienteId: atendimento.cliente.id.toString(),
      tipoAtendimentoId: atendimento.tipoAtendimento.id.toString(),
      moduloId: atendimento.modulo.id.toString(),
      assuntoId: atendimento.assunto.id.toString(),
      prioridade: atendimento.tipoAtendimento.prioridade.toString(),
      descricao: atendimento.descricao || "",
      dataInicio: formatToDatetimeLocal(atendimento.dataInicio),
      dataFim: formatToDatetimeLocal(atendimento.dataFim),
    });

    onOpenEditar();
  };

  const handleEnviarEdicao = async () => {
    try {
      if (editFormData.dataFim) {
        const dataFimDate = new Date(editFormData.dataFim);
        const agora = new Date();

        if (dataFimDate > agora) {
          addToast({
            title: "Erro",
            description:
              "A data de término não pode ser futura. Por favor, selecione uma data até o momento atual.",
            color: "danger",
          });
          return;
        }
      }

      if (editFormData.dataFim && editFormData.dataInicio) {
        const dataFimDate = new Date(editFormData.dataFim);
        const dataInicioDate = new Date(editFormData.dataInicio);

        if (dataFimDate < dataInicioDate) {
          addToast({
            title: "Erro",
            description:
              "A data de término não pode ser anterior à data de início.",
            color: "danger",
          });
          return;
        }
      }

      const dataToSend = {
        ...editFormData,
        dataInicio: editFormData.dataInicio
          ? new Date(editFormData.dataInicio).toISOString()
          : undefined,
        dataFim: editFormData.dataFim
          ? new Date(editFormData.dataFim).toISOString()
          : undefined,
      };

      await EditarAtendimento(selectedAtendimento.id, dataToSend);
      addToast({
        title: "Sucesso",
        description: "Atendimento editado com sucesso",
        color: "success",
      });
      onCloseEditar();
      buscarAtendimentos();
    } catch (error) {
      addToast({
        title: "Erro",
        description: error.response.data.message,
        color: "danger",
      });
    }
  };

  const handleDeletarAtendimento = async (id) => {
    try {
      await DeletarAtendimento(id);
      addToast({
        title: "Sucesso",
        description: "Atendimento deletado com sucesso",
        color: "success",
      });
      buscarAtendimentos();
    } catch (error) {
      addToast({
        title: "Erro",
        description: "Erro ao deletar atendimento",
        color: "danger",
      });
    }
  };

  const handleFinalizarAtendimento = async (atendimento) => {
    try {
      await FinalizarAtendimento(atendimento.id, {
        titulo: atendimento.titulo,
        descricao: atendimento.descricao || "",
        solucao: "",
        prioridade: atendimento.tipoAtendimento.prioridade,
        observacoes: "",
        usuarioId: atendimento.usuario.id,
        statusId: atendimento.status?.id || 0,
        moduloId: atendimento.modulo.id,
      });
      addToast({
        title: "Sucesso",
        description: "Atendimento finalizado com sucesso",
        color: "success",
      });
      buscarAtendimentos();
    } catch (error) {
      addToast({
        title: "Erro",
        description:
          error.response?.data?.message || "Erro ao finalizar atendimento",
        color: "danger",
      });
    }
  };

  const handleVizualizarAtendimento = (atendimento) => {
    setSelectedAtendimento(atendimento);
    onOpenVisualizar();
  };

  useEffect(() => {
    buscarAtendimentos(1);
  }, []);

  useEffect(() => {
    if (isOpenCriar || isOpenEditar) {
      fetchCas();
      fetchClientes();
      fetchTipoAtendimentos();
      fetchAssuntos();
      fetchModulos();
    }
  }, [isOpenCriar, isOpenEditar]);

  return (
    <div className="w-full h-screen justify-between flex items-center flex-col gap-5">
      <Card className="w-full h-[25%] min-h-[130px] flex flex-col">
        <CardHeader className="flex gap-5 items-end">
          <img src={exactus_logo} alt="Exactus Logo" width={200} />
          <h1 className="text-gray-600 text-2xl font-sans">
            Controle de Atendimento
          </h1>
        </CardHeader>
        <CardBody>
          <div className="flex gap-2 items-end">
            <Input
              placeholder="Buscar atendimento (CA, Cliente, Titulo)"
              radius="sm"
              variant="faded"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="flex-1"
            />
            {/* <Input
              placeholder="Data início"
              radius="sm"
              variant="faded"
              value={dataInicio ? maskDate(dataInicio) : ""}
              onChange={(e) => setDataInicio(e.target.value)}
              maxLength={10}
              className="w-40"
            />
            <Input
              placeholder="Data fim"
              radius="sm"
              variant="faded"
              value={dataFim ? maskDate(dataFim) : ""}
              onChange={(e) => setDataFim(e.target.value)}
              maxLength={10}
              className="w-40"
            /> */}
            <Button
              color="warning"
              radius="sm"
              onPress={() => {
                const inicio =
                  dataInicio && dataInicio.length === 10
                    ? convertDateToISO(dataInicio)
                    : null;
                const fim =
                  dataFim && dataFim.length === 10
                    ? convertDateToISO(dataFim)
                    : null;
                const search = termoBusca.trim() !== "" ? termoBusca : null;

                // Salvar filtros ativos
                setFiltrosAtivos({ dataInicio: inicio, dataFim: fim, search });
                buscarAtendimentos(1, inicio, fim, search);
              }}
            >
              Buscar
            </Button>
            <Button
              color="default"
              variant="light"
              radius="sm"
              onPress={() => {
                setDataInicio("");
                setDataFim("");
                setTermoBusca("");
                setFiltrosAtivos({
                  dataInicio: null,
                  dataFim: null,
                  search: null,
                });
                buscarAtendimentos(1, null, null, null);
              }}
            >
              Limpar
            </Button>
          </div>
        </CardBody>
      </Card>
      <Table
        className="h-full"
        isCompact
        isStriped
        selectionMode="single"
        color="warning"
        topContent={
          totalRegistros > 0 && (
            <div className="flex flex-col gap-2 px-2">
              <div className="flex justify-between items-center">
                <span className="text-small text-default-500">
                  Total de {totalRegistros} atendimento
                  {totalRegistros !== 1 ? "s" : ""}
                </span>
                <span className="text-small text-default-500">
                  Página {paginaAtual} de {totalPaginas}
                </span>
              </div>
              {(filtrosAtivos.dataInicio ||
                filtrosAtivos.dataFim ||
                filtrosAtivos.search) && (
                <div className="flex gap-2 items-center text-small text-warning-600">
                  <span className="font-semibold">Filtros ativos:</span>
                  {filtrosAtivos.dataInicio && (
                    <span className="bg-warning-100 px-2 py-1 rounded">
                      De: {dataInicio}
                    </span>
                  )}
                  {filtrosAtivos.dataFim && (
                    <span className="bg-warning-100 px-2 py-1 rounded">
                      Até: {dataFim}
                    </span>
                  )}
                  {filtrosAtivos.search && (
                    <span className="bg-warning-100 px-2 py-1 rounded">
                      Busca: {filtrosAtivos.search}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        }
        bottomContent={
          totalPaginas > 1 && (
            <div className="w-full flex justify-center items-center gap-4">
              <Pagination
                color="warning"
                variant="faded"
                radius="sm"
                page={paginaAtual}
                total={totalPaginas}
                showControls
                onChange={(page) => {
                  // Usar os filtros ativos salvos para manter a busca na paginação
                  buscarAtendimentos(
                    page,
                    filtrosAtivos.dataInicio,
                    filtrosAtivos.dataFim,
                    filtrosAtivos.search
                  );
                }}
              />
            </div>
          )
        }
      >
        <TableHeader>
          <TableColumn>TITULO</TableColumn>
          <TableColumn>CA</TableColumn>
          <TableColumn>CLIENTE</TableColumn>
          <TableColumn>CONTATO</TableColumn>
          <TableColumn>TIPO ATENDIMENTO</TableColumn>
          <TableColumn>DESCRICAO</TableColumn>
          <TableColumn>DATA INICIO</TableColumn>
          <TableColumn>DATA TERMINO</TableColumn>
          <TableColumn>AÇÕES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Nenhum atendimento encontrado">
          {atendimentos.map((atendimento) => (
            <TableRow
              key={atendimento.id}
              className="cursor-pointer"
              onPress={() => handleVizualizarAtendimento(atendimento)}
            >
              <TableCell>{atendimento.titulo}</TableCell>
              <TableCell>{atendimento.ca.nomeCa}</TableCell>
              <TableCell>{atendimento.cliente.nomeCliente}</TableCell>
              <TableCell>{atendimento.cliente.telefone}</TableCell>
              <TableCell>{atendimento.tipoAtendimento.nome}</TableCell>
              <TableCell>{atendimento.descricao || "-"}</TableCell>
              <TableCell>
                {new Date(atendimento.dataInicio).toLocaleString("pt-BR")}
              </TableCell>
              <TableCell>
                {atendimento.dataFim
                  ? new Date(atendimento.dataFim).toLocaleString("pt-BR")
                  : "-"}
              </TableCell>
              <TableCell>
                <Popover placement="left" showArrow>
                  <PopoverTrigger>
                    <Button
                      radius="sm"
                      color="default"
                      variant="light"
                      size="sm"
                      isIconOnly
                    >
                      <Icon path={mdiDotsVertical} size={0.8} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="flex flex-col p-2 gap-2">
                      {!atendimento.dataFim && (
                        <Button
                          radius="sm"
                          color="success"
                          variant="flat"
                          size="sm"
                          startContent={
                            <Icon path={mdiCheckCircle} size={0.7} />
                          }
                          onPress={() =>
                            handleFinalizarAtendimento(atendimento)
                          }
                          className="justify-start"
                        >
                          Finalizar
                        </Button>
                      )}
                      <Button
                        radius="sm"
                        color="default"
                        variant="flat"
                        size="sm"
                        startContent={<Icon path={mdiPencil} size={0.7} />}
                        onPress={() => handleEditarAtendimento(atendimento)}
                        className="justify-start"
                      >
                        Editar
                      </Button>
                      <Button
                        radius="sm"
                        color="danger"
                        variant="flat"
                        size="sm"
                        startContent={<Icon path={mdiDelete} size={0.7} />}
                        onPress={() => handleDeletarAtendimento(atendimento.id)}
                        className="justify-start"
                      >
                        Deletar
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Bottombar
        onPressCreate={onOpenCriar}
        onPressSuggestion={onOpenSugestao}
      />
      <ModalSugestao
        isOpen={isOpenSugestao}
        onClose={onCloseSugestao}
        onOpenChange={onOpenChangeSugestao}
      />
      <Modal
        isOpen={isOpenCriar}
        onOpenChange={onOpenChangeCriar}
        onClose={onCloseCriar}
        size="2xl"
        placement="center"
        backdrop="opaque"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-xl font-bold">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-100">
                    <Icon
                      path={mdiPencil}
                      size={1.2}
                      className="text-warning-600"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Novo Atendimento
                    </h2>
                    <p className="text-sm font-normal text-gray-500">
                      Registre um novo atendimento no sistema
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <Form className="flex flex-col gap-5">
                  {/* Título */}
                  <div className="w-full">
                    <Input
                      isRequired
                      label="Título do Atendimento"
                      placeholder="Ex: Suporte técnico - Problema no módulo"
                      value={formData.titulo}
                      onChange={(e) =>
                        setFormData({ ...formData, titulo: e.target.value })
                      }
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        input: "text-gray-900",
                        inputWrapper:
                          "border-2 border-gray-200 hover:border-warning-400 focus-within:!border-warning-500",
                      }}
                    />
                  </div>

                  {/* CA e Cliente */}
                  <div className="w-full flex gap-4">
                    <Select
                      isRequired
                      label="Centro de Atendimento"
                      placeholder="Selecione o CA"
                      selectedKeys={formData.caId ? [formData.caId] : []}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        if (value) {
                          fetchClientePorCa(value);
                        } else {
                          setFormData({ ...formData, caId: "", clienteId: "" });
                        }
                      }}
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        trigger:
                          "border-2 border-gray-200 hover:border-warning-400 data-[open=true]:border-warning-500",
                        value: "text-gray-900",
                      }}
                    >
                      {cas.map((ca) => (
                        <SelectItem key={ca.id.toString()}>
                          {ca.nomeCa}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      isRequired
                      label="Cliente"
                      placeholder="Selecione o Cliente"
                      isDisabled={
                        !formData.caId || clientesFiltrados.length <= 1
                      }
                      selectedKeys={
                        formData.clienteId ? [formData.clienteId] : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setFormData({ ...formData, clienteId: value });
                      }}
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        trigger:
                          "border-2 border-gray-200 hover:border-warning-400 data-[open=true]:border-warning-500",
                        value: "text-gray-900",
                      }}
                    >
                      {clientesFiltrados.map((cliente) => (
                        <SelectItem key={cliente.id.toString()}>
                          {cliente.nomeCliente}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Tipo de Atendimento e Módulo */}
                  <div className="w-full flex gap-4">
                    <Select
                      isRequired
                      label="Tipo de Atendimento"
                      placeholder="Selecione o tipo"
                      selectedKeys={
                        formData.tipoAtendimentoId
                          ? [formData.tipoAtendimentoId]
                          : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setFormData({ ...formData, tipoAtendimentoId: value });
                      }}
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        trigger:
                          "border-2 border-gray-200 hover:border-warning-400 data-[open=true]:border-warning-500",
                        value: "text-gray-900",
                      }}
                    >
                      {tipoAtendimentos.map((tipo) => (
                        <SelectItem key={tipo.id.toString()}>
                          {tipo.nome}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      isRequired
                      label="Módulo"
                      placeholder="Selecione o módulo"
                      selectedKeys={
                        formData.moduloId ? [formData.moduloId] : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setFormData({ ...formData, moduloId: value });
                      }}
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        trigger:
                          "border-2 border-gray-200 hover:border-warning-400 data-[open=true]:border-warning-500",
                        value: "text-gray-900",
                      }}
                    >
                      {modulos.map((modulo) => (
                        <SelectItem key={modulo.id.toString()}>
                          {modulo.nomeModulo}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Assunto e Prioridade */}
                  <div className="w-full flex gap-4">
                    <Select
                      isRequired
                      label="Assunto"
                      placeholder="Selecione o assunto"
                      selectedKeys={
                        formData.assuntoId ? [formData.assuntoId] : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setFormData({ ...formData, assuntoId: value });
                      }}
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        trigger:
                          "border-2 border-gray-200 hover:border-warning-400 data-[open=true]:border-warning-500",
                        value: "text-gray-900",
                      }}
                    >
                      {assuntos.map((assunto) => (
                        <SelectItem key={assunto.id.toString()}>
                          {assunto.descricao}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      className="w-1/3"
                      isRequired
                      label="Prioridade"
                      placeholder="Prioridade"
                      selectedKeys={
                        formData.prioridade ? [formData.prioridade] : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setFormData({ ...formData, prioridade: value });
                      }}
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        trigger:
                          "border-2 border-gray-200 hover:border-warning-400 data-[open=true]:border-warning-500",
                        value: "text-gray-900",
                      }}
                    >
                      <SelectItem key="1">Baixo</SelectItem>
                      <SelectItem key="2">Normal</SelectItem>
                      <SelectItem key="3">Alto</SelectItem>
                      <SelectItem key="4">Urgente</SelectItem>
                    </Select>
                  </div>

                  {/* Descrição */}
                  <div className="w-full">
                    <Textarea
                      isRequired
                      label="Descrição Detalhada"
                      placeholder="Descreva o problema ou solicitação com o máximo de detalhes possível..."
                      value={formData.descricao}
                      onChange={(e) =>
                        setFormData({ ...formData, descricao: e.target.value })
                      }
                      variant="bordered"
                      radius="lg"
                      minRows={5}
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        input: "text-gray-900",
                        inputWrapper:
                          "border-2 border-gray-200 hover:border-warning-400 focus-within:!border-warning-500",
                      }}
                    />
                  </div>
                </Form>
              </ModalBody>
              <ModalFooter className="gap-3">
                <Button
                  color="default"
                  variant="flat"
                  onPress={onClose}
                  size="lg"
                  className="font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  color="warning"
                  onPress={handleCreateAtendimento}
                  isLoading={loading}
                  isDisabled={
                    !formData.titulo ||
                    !formData.caId ||
                    !formData.clienteId ||
                    !formData.tipoAtendimentoId ||
                    !formData.moduloId ||
                    !formData.assuntoId ||
                    !formData.prioridade ||
                    !formData.descricao
                  }
                  size="lg"
                  className="font-semibold"
                  startContent={
                    !loading && <Icon path={mdiPencil} size={0.8} />
                  }
                >
                  Criar Atendimento
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isOpenEditar}
        onOpenChange={onOpenChangeEditar}
        onClose={onCloseEditar}
        size="2xl"
        placement="center"
        backdrop="opaque"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-xl font-bold">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-100">
                    <Icon
                      path={mdiPencil}
                      size={1.2}
                      className="text-warning-600"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Editar Atendimento
                    </h2>
                    <p className="text-sm font-normal text-gray-500">
                      Atualize as informações do atendimento
                    </p>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <Form className="flex flex-col gap-5">
                  {/* Título */}
                  <div className="w-full">
                    <Input
                      isRequired
                      label="Título do Atendimento"
                      placeholder="Ex: Suporte técnico - Problema no módulo"
                      value={editFormData.titulo}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          titulo: e.target.value,
                        })
                      }
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        input: "text-gray-900",
                        inputWrapper:
                          "border-2 border-gray-200 hover:border-warning-400 focus-within:!border-warning-500",
                      }}
                    />
                  </div>

                  {/* CA e Cliente */}
                  <div className="w-full flex gap-4">
                    <Select
                      isRequired
                      label="Centro de Atendimento"
                      placeholder="Selecione o CA"
                      selectedKeys={
                        editFormData.caId ? [editFormData.caId] : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        if (value) {
                          fetchClientePorCaEditar(value);
                        } else {
                          setEditFormData({
                            ...editFormData,
                            caId: "",
                            clienteId: "",
                          });
                          setClientesFiltradosEditar([]);
                        }
                      }}
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        trigger:
                          "border-2 border-gray-200 hover:border-warning-400 data-[open=true]:border-warning-500",
                        value: "text-gray-900",
                      }}
                    >
                      {cas.map((ca) => (
                        <SelectItem key={ca.id.toString()}>
                          {ca.nomeCa}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      isRequired
                      label="Cliente"
                      placeholder="Selecione o Cliente"
                      isDisabled={
                        !editFormData.caId ||
                        clientesFiltradosEditar.length <= 1
                      }
                      selectedKeys={
                        editFormData.clienteId ? [editFormData.clienteId] : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setEditFormData({ ...editFormData, clienteId: value });
                      }}
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        trigger:
                          "border-2 border-gray-200 hover:border-warning-400 data-[open=true]:border-warning-500",
                        value: "text-gray-900",
                      }}
                    >
                      {clientesFiltradosEditar.map((cliente) => (
                        <SelectItem key={cliente.id.toString()}>
                          {cliente.nomeCliente}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Tipo de Atendimento e Módulo */}
                  <div className="w-full flex gap-4">
                    <Select
                      isRequired
                      label="Tipo de Atendimento"
                      placeholder="Selecione o tipo"
                      selectedKeys={
                        editFormData.tipoAtendimentoId
                          ? [editFormData.tipoAtendimentoId]
                          : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setEditFormData({
                          ...editFormData,
                          tipoAtendimentoId: value,
                        });
                      }}
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        trigger:
                          "border-2 border-gray-200 hover:border-warning-400 data-[open=true]:border-warning-500",
                        value: "text-gray-900",
                      }}
                    >
                      {tipoAtendimentos.map((tipo) => (
                        <SelectItem key={tipo.id.toString()}>
                          {tipo.nome}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      isRequired
                      label="Módulo"
                      placeholder="Selecione o módulo"
                      selectedKeys={
                        editFormData.moduloId ? [editFormData.moduloId] : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setEditFormData({ ...editFormData, moduloId: value });
                      }}
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        trigger:
                          "border-2 border-gray-200 hover:border-warning-400 data-[open=true]:border-warning-500",
                        value: "text-gray-900",
                      }}
                    >
                      {modulos.map((modulo) => (
                        <SelectItem key={modulo.id.toString()}>
                          {modulo.nomeModulo}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Assunto e Prioridade */}
                  <div className="w-full flex gap-4">
                    <Select
                      isRequired
                      label="Assunto"
                      placeholder="Selecione o assunto"
                      selectedKeys={
                        editFormData.assuntoId ? [editFormData.assuntoId] : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setEditFormData({ ...editFormData, assuntoId: value });
                      }}
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        trigger:
                          "border-2 border-gray-200 hover:border-warning-400 data-[open=true]:border-warning-500",
                        value: "text-gray-900",
                      }}
                    >
                      {assuntos.map((assunto) => (
                        <SelectItem key={assunto.id.toString()}>
                          {assunto.descricao}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      className="w-1/3"
                      isRequired
                      label="Prioridade"
                      placeholder="Prioridade"
                      selectedKeys={
                        editFormData.prioridade ? [editFormData.prioridade] : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setEditFormData({ ...editFormData, prioridade: value });
                      }}
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        trigger:
                          "border-2 border-gray-200 hover:border-warning-400 data-[open=true]:border-warning-500",
                        value: "text-gray-900",
                      }}
                    >
                      <SelectItem key="1">Baixo</SelectItem>
                      <SelectItem key="2">Normal</SelectItem>
                      <SelectItem key="3">Alto</SelectItem>
                      <SelectItem key="4">Urgente</SelectItem>
                    </Select>
                  </div>

                  {/* Datas de Início e Fim */}
                  <div className="w-full flex gap-4">
                    <Input
                      isRequired
                      type="datetime-local"
                      label="Data e Hora de Início"
                      value={editFormData.dataInicio || ""}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          dataInicio: e.target.value,
                        })
                      }
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        input: "text-gray-900",
                        inputWrapper:
                          "border-2 border-gray-200 hover:border-warning-400 focus-within:!border-warning-500",
                      }}
                    />

                    <Input
                      type="datetime-local"
                      label="Data e Hora de Término"
                      value={editFormData.dataFim || ""}
                      min={editFormData.dataInicio || undefined}
                      max={new Date().toISOString().slice(0, 16)}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          dataFim: e.target.value,
                        })
                      }
                      variant="bordered"
                      radius="lg"
                      size="lg"
                      description="Deve ser entre a data de início e a data atual"
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        input: "text-gray-900",
                        inputWrapper:
                          "border-2 border-gray-200 hover:border-warning-400 focus-within:!border-warning-500",
                      }}
                    />
                  </div>

                  {/* Descrição */}
                  <div className="w-full">
                    <Textarea
                      isRequired
                      label="Descrição Detalhada"
                      placeholder="Descreva o problema ou solicitação com o máximo de detalhes possível..."
                      value={editFormData.descricao}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          descricao: e.target.value,
                        })
                      }
                      variant="bordered"
                      radius="lg"
                      minRows={5}
                      classNames={{
                        label: "text-gray-700 font-semibold",
                        input: "text-gray-900",
                        inputWrapper:
                          "border-2 border-gray-200 hover:border-warning-400 focus-within:!border-warning-500",
                      }}
                    />
                  </div>
                </Form>
              </ModalBody>
              <ModalFooter className="gap-3">
                <Button
                  color="default"
                  variant="flat"
                  onPress={onClose}
                  size="lg"
                  className="font-semibold"
                >
                  Cancelar
                </Button>
                <Button
                  color="warning"
                  onPress={handleEnviarEdicao}
                  isLoading={loading}
                  isDisabled={
                    !editFormData.titulo ||
                    !editFormData.caId ||
                    !editFormData.clienteId ||
                    !editFormData.tipoAtendimentoId ||
                    !editFormData.moduloId ||
                    !editFormData.assuntoId ||
                    !editFormData.prioridade ||
                    !editFormData.descricao
                  }
                  size="lg"
                  className="font-semibold"
                  startContent={
                    !loading && <Icon path={mdiPencil} size={0.8} />
                  }
                >
                  Salvar Alterações
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isOpenVisualizar}
        onOpenChange={onOpenChangeVisualizar}
        onClose={onCloseVisualizar}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 shadow-md border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Detalhes do Atendimento
                </h2>
                {selectedAtendimento && (
                  <div className="flex gap-2 items-center mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedAtendimento.dataFim
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {selectedAtendimento.dataFim
                        ? "✓ Finalizado"
                        : "⏱ Em andamento"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedAtendimento.tipoAtendimento.prioridade === 4
                          ? "bg-red-100 text-red-700"
                          : selectedAtendimento.tipoAtendimento.prioridade === 3
                          ? "bg-orange-100 text-orange-700"
                          : selectedAtendimento.tipoAtendimento.prioridade === 2
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedAtendimento.tipoAtendimento.prioridade === 1
                        ? "Baixo"
                        : selectedAtendimento.tipoAtendimento.prioridade === 2
                        ? "Normal"
                        : selectedAtendimento.tipoAtendimento.prioridade === 3
                        ? "Alto"
                        : "Urgente"}
                    </span>
                  </div>
                )}
              </ModalHeader>
              <ModalBody className="py-6">
                {selectedAtendimento && (
                  <div className="flex flex-col gap-6">
                    {/* Título */}
                    {selectedAtendimento.titulo && (
                      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 shadow-sm">
                        <CardBody className="py-4">
                          <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                            Título
                          </p>
                          <p className="text-lg font-semibold text-gray-800">
                            {selectedAtendimento.titulo}
                          </p>
                        </CardBody>
                      </Card>
                    )}

                    {/* Informações do Cliente */}
                    <div>
                      <h3 className="text-sm uppercase tracking-wide font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-warning-500 rounded"></span>
                        Informações do Cliente
                      </h3>
                      <Card className="shadow-sm">
                        <CardBody className="py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                                CA
                              </p>
                              <p className="text-base font-medium text-gray-800">
                                {selectedAtendimento.ca.nomeCa}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                                Cliente
                              </p>
                              <p className="text-base font-medium text-gray-800">
                                {selectedAtendimento.cliente.nomeCliente}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                                Telefone
                              </p>
                              <p className="text-base text-gray-700">
                                {selectedAtendimento.cliente.telefone || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                                E-mail
                              </p>
                              <p className="text-base text-gray-700">
                                {selectedAtendimento.cliente.email || "-"}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </div>

                    {/* Detalhes do Atendimento */}
                    <div>
                      <h3 className="text-sm uppercase tracking-wide font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-warning-500 rounded"></span>
                        Detalhes do Atendimento
                      </h3>
                      <Card className="shadow-sm">
                        <CardBody className="py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                                Tipo de Atendimento
                              </p>
                              <p className="text-base font-medium text-gray-800">
                                {selectedAtendimento.tipoAtendimento.nome}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                                Módulo
                              </p>
                              <p className="text-base font-medium text-gray-800">
                                {selectedAtendimento.modulo.nomeModulo}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                                Assunto
                              </p>
                              <p className="text-base font-medium text-gray-800">
                                {selectedAtendimento.assunto.descricao}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </div>

                    {/* Datas e Responsável */}
                    <div>
                      <h3 className="text-sm uppercase tracking-wide font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-warning-500 rounded"></span>
                        Cronologia
                      </h3>
                      <Card className="shadow-sm">
                        <CardBody className="py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                                📅 Data de Início
                              </p>
                              <p className="text-base text-gray-700">
                                {new Date(
                                  selectedAtendimento.dataInicio
                                ).toLocaleString("pt-BR")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                                📅 Data de Término
                              </p>
                              <p className="text-base text-gray-700">
                                {selectedAtendimento.dataFim
                                  ? new Date(
                                      selectedAtendimento.dataFim
                                    ).toLocaleString("pt-BR")
                                  : "-"}
                              </p>
                            </div>
                            
                          </div>
                        </CardBody>
                      </Card>
                    </div>

                    {/* Descrição */}
                    <div>
                      <h3 className="text-sm uppercase tracking-wide font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-warning-500 rounded"></span>
                        Descrição
                      </h3>
                      <Card className="shadow-sm">
                        <CardBody className="py-4">
                          <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {selectedAtendimento.descricao || "-"}
                          </p>
                        </CardBody>
                      </Card>
                    </div>

                    {/* Solução */}
                    {selectedAtendimento.solucao && (
                      <div>
                        <h3 className="text-sm uppercase tracking-wide font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="w-1 h-4 bg-green-500 rounded"></span>
                          Solução
                        </h3>
                        <Card className="shadow-sm bg-green-50">
                          <CardBody className="py-4">
                            <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {selectedAtendimento.solucao}
                            </p>
                          </CardBody>
                        </Card>
                      </div>
                    )}

                    {/* Observações */}
                    {selectedAtendimento.observacoes && (
                      <div>
                        <h3 className="text-sm uppercase tracking-wide font-bold text-gray-700 mb-3 flex items-center gap-2">
                          <span className="w-1 h-4 bg-blue-500 rounded"></span>
                          Observações
                        </h3>
                        <Card className="shadow-sm bg-blue-50">
                          <CardBody className="py-4">
                            <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {selectedAtendimento.observacoes}
                            </p>
                          </CardBody>
                        </Card>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="shadow-md border-t border-gray-200 pt-4">
                <Button color="default" variant="light" onPress={onClose}>
                  Fechar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default Home;
