import {
  addToast,
  Button,
  Card,
  CardBody,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";
import {
  TipoAtendimentos as GetTipoAtendimentos,
  CadastrarTipoAtendimento,
  EditarTipoAtendimento,
  DeletarTipoAtendimento,
} from "../service/service";
import Icon from "@mdi/react";
import { mdiDelete, mdiPencil, mdiRefresh, mdiDotsVertical } from "@mdi/js";

function TipoAtendimento() {
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
  const [tipoAtendimentos, setTipoAtendimentos] = useState([]);
  const [selectedTipoAtendimento, setSelectedTipoAtendimento] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    prioridade: "",
  });
  const [editFormData, setEditFormData] = useState({
    nome: "",
    descricao: "",
    prioridade: "",
  });

  const prioridadeOptions = [
    { key: "1", label: "1 - Baixa" },
    { key: "2", label: "2 - Média" },
    { key: "3", label: "3 - Alta" },
    { key: "4", label: "4 - Urgente" },
    { key: "5", label: "5 - Crítica" },
  ];

  const getPrioridadeLabel = (prioridade) => {
    const labels = {
      1: "Baixa",
      2: "Média",
      3: "Alta",
      4: "Urgente",
      5: "Crítica",
    };
    return labels[prioridade] || prioridade;
  };

  const fetchTipoAtendimentos = async () => {
    setLoading(true);
    try {
      const response = await GetTipoAtendimentos();
      setTipoAtendimentos(response.dados);
    } catch (error) {
      addToast({
        title: "Erro ao buscar tipos de atendimento",
        description: error.message,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCriarTipoAtendimento = async (e) => {
    e.preventDefault();
    try {
      await CadastrarTipoAtendimento(formData);
      addToast({
        title: "Tipo de atendimento criado",
        description: "O tipo de atendimento foi criado com sucesso.",
        color: "success",
      });
      fetchTipoAtendimentos();
      setFormData({
        nome: "",
        descricao: "",
        prioridade: "",
      });
    } catch (error) {
      addToast({
        title: "Erro ao criar tipo de atendimento",
        description: error.message,
        color: "danger",
      });
    } finally {
      onCloseCriar();
    }
  };

  const handleEditarTipoAtendimento = (tipoAtendimento) => {
    setSelectedTipoAtendimento(tipoAtendimento);
    setEditFormData({
      nome: tipoAtendimento.nome,
      descricao: tipoAtendimento.descricao,
      prioridade: tipoAtendimento.prioridade.toString(),
    });
    onOpenEditar();
  };

  const handleEnviarEdicao = async (e) => {
    e.preventDefault();
    try {
      await EditarTipoAtendimento(selectedTipoAtendimento.id, editFormData);
      addToast({
        title: "Tipo de atendimento editado",
        description: "O tipo de atendimento foi editado com sucesso.",
        color: "success",
      });
      fetchTipoAtendimentos();
    } catch (error) {
      addToast({
        title: "Erro ao editar tipo de atendimento",
        description: error.message,
        color: "danger",
      });
    } finally {
      onCloseEditar();
    }
  };

  const handleDeletarTipoAtendimento = async (id) => {
    try {
      await DeletarTipoAtendimento(id);
      addToast({
        title: "Tipo de atendimento deletado",
        description: "O tipo de atendimento foi deletado com sucesso.",
        color: "success",
      });
      fetchTipoAtendimentos();
    } catch (error) {
      addToast({
        title: "Erro ao deletar tipo de atendimento",
        description: error.message,
        color: "danger",
      });
    }
  };

  useEffect(() => {
    fetchTipoAtendimentos();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-5 p-5">
      <Card radius="sm">
        <CardBody>
          <div className="w-full flex justify-between items-center">
            <h1 className="text-gray-700 text-3xl font-sans">
              Tipos de Atendimento
            </h1>
            <div className="flex gap-2">
              <Tooltip content="Recarregar">
                <Button
                  isIconOnly
                  radius="sm"
                  color="default"
                  variant="faded"
                  isLoading={loading}
                  onPress={fetchTipoAtendimentos}
                >
                  <Icon path={mdiRefresh} size={0.8} />
                </Button>
              </Tooltip>

              <Button
                radius="sm"
                color="warning"
                variant="faded"
                onPress={onOpenCriar}
              >
                Cadastrar Novo Tipo de Atendimento
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      <Table
        radius="sm"
        aria-label="Tabela de tipos de atendimento"
        isStriped
        isCompact
        selectionMode="single"
        color="warning"
      >
        <TableHeader>
          <TableColumn>NOME</TableColumn>
          <TableColumn>DESCRIÇÃO</TableColumn>
          <TableColumn>PRIORIDADE</TableColumn>
          <TableColumn>AÇÕES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Nenhum tipo de atendimento encontrado">
          {tipoAtendimentos.map((tipoAtendimento) => (
            <TableRow key={tipoAtendimento.id}>
              <TableCell>{tipoAtendimento.nome}</TableCell>
              <TableCell>{tipoAtendimento.descricao}</TableCell>
              <TableCell>
                {tipoAtendimento.prioridade} -{" "}
                {getPrioridadeLabel(tipoAtendimento.prioridade)}
              </TableCell>
              <TableCell>
                <Popover placement="left" showArrow>
                  <PopoverTrigger>
                    <Button isIconOnly radius="sm" variant="light" size="sm">
                      <Icon path={mdiDotsVertical} size={0.8} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="flex flex-col gap-2 p-2">
                      <Button
                        radius="sm"
                        color="default"
                        variant="flat"
                        size="sm"
                        startContent={<Icon path={mdiPencil} size={0.7} />}
                        onPress={() =>
                          handleEditarTipoAtendimento(tipoAtendimento)
                        }
                        className="justify-start"
                      >
                        Editar tipo
                      </Button>
                      <Button
                        radius="sm"
                        color="danger"
                        variant="flat"
                        size="sm"
                        startContent={<Icon path={mdiDelete} size={0.7} />}
                        onPress={() =>
                          handleDeletarTipoAtendimento(tipoAtendimento.id)
                        }
                        className="justify-start"
                      >
                        Deletar tipo
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal Criar Tipo de Atendimento */}
      <Modal radius="sm" isOpen={isOpenCriar} onOpenChange={onOpenChangeCriar}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Cadastrar novo tipo de atendimento
              </ModalHeader>
              <ModalBody>
                <Form
                  id="form-new-tipo-atendimento"
                  onSubmit={handleCriarTipoAtendimento}
                >
                  <Input
                    isRequired
                    radius="sm"
                    label="Nome"
                    placeholder="Digite o nome do tipo de atendimento"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                  />
                  <Textarea
                    isRequired
                    radius="sm"
                    label="Descrição"
                    placeholder="Digite a descrição do tipo de atendimento"
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                  />
                  <Select
                    isRequired
                    radius="sm"
                    label="Prioridade"
                    placeholder="Selecione a prioridade"
                    selectedKeys={
                      formData.prioridade ? [formData.prioridade] : []
                    }
                    onSelectionChange={(keys) => {
                      const prioridade = Array.from(keys)[0];
                      setFormData({ ...formData, prioridade });
                    }}
                  >
                    {prioridadeOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button
                  radius="sm"
                  color="danger"
                  variant="light"
                  onPress={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  radius="sm"
                  form="form-new-tipo-atendimento"
                  color="warning"
                  variant="faded"
                  type="submit"
                >
                  Criar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal Editar Tipo de Atendimento */}
      <Modal
        radius="sm"
        isOpen={isOpenEditar}
        onOpenChange={onOpenChangeEditar}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Editar tipo de atendimento
              </ModalHeader>
              <ModalBody>
                <Form
                  id="form-edit-tipo-atendimento"
                  onSubmit={handleEnviarEdicao}
                >
                  <Input
                    isRequired
                    radius="sm"
                    label="Nome"
                    placeholder="Digite o nome do tipo de atendimento"
                    value={editFormData.nome}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        nome: e.target.value,
                      })
                    }
                  />
                  <Textarea
                    isRequired
                    radius="sm"
                    label="Descrição"
                    placeholder="Digite a descrição do tipo de atendimento"
                    value={editFormData.descricao}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        descricao: e.target.value,
                      })
                    }
                  />
                  <Select
                    isRequired
                    radius="sm"
                    label="Prioridade"
                    placeholder="Selecione a prioridade"
                    selectedKeys={
                      editFormData.prioridade ? [editFormData.prioridade] : []
                    }
                    onSelectionChange={(keys) => {
                      const prioridade = Array.from(keys)[0];
                      setEditFormData({ ...editFormData, prioridade });
                    }}
                  >
                    {prioridadeOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                </Form>
              </ModalBody>
              <ModalFooter>
                <Button
                  radius="sm"
                  color="danger"
                  variant="light"
                  onPress={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  radius="sm"
                  form="form-edit-tipo-atendimento"
                  color="warning"
                  variant="faded"
                  type="submit"
                >
                  Editar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default TipoAtendimento;
