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
  Assuntos as GetAssuntos,
  CadastrarAssunto,
  EditarAssunto,
  DeletarAssunto,
  Modulos,
} from "../service/service";
import Icon from "@mdi/react";
import { mdiDelete, mdiPencil, mdiRefresh, mdiDotsVertical } from "@mdi/js";

function Assuntos() {
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
  const [assuntos, setAssuntos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [selectedAssunto, setSelectedAssunto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipoAssunto: "",
    moduloId: "",
    descricao: "",
  });
  const [editFormData, setEditFormData] = useState({
    tipoAssunto: "",
    moduloId: "",
    descricao: "",
  });

  const fetchAssuntos = async () => {
    setLoading(true);
    try {
      const response = await GetAssuntos();
      setAssuntos(response.dados);
    } catch (error) {
      addToast({
        title: "Erro ao buscar assuntos",
        description: error.message,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchModulos = async () => {
    try {
      const response = await Modulos();
      setModulos(response.dados);
    } catch (error) {
      addToast({
        title: "Erro ao buscar módulos",
        description: error.message,
        color: "danger",
      });
    }
  };

  const handleCriarAssunto = async (e) => {
    e.preventDefault();
    try {
      await CadastrarAssunto(formData);
      addToast({
        title: "Assunto criado",
        description: "O assunto foi criado com sucesso.",
        color: "success",
      });
      fetchAssuntos();
      setFormData({
        tipoAssunto: "",
        moduloId: "",
        descricao: "",
      });
    } catch (error) {
      addToast({
        title: "Erro ao criar assunto",
        description: error.message,
        color: "danger",
      });
    } finally {
      onCloseCriar();
    }
  };

  const handleEditarAssunto = (assunto) => {
    setSelectedAssunto(assunto);
    setEditFormData({
      tipoAssunto: assunto.tipoAssunto,
      moduloId: assunto.moduloId.toString(),
      descricao: assunto.descricao,
    });
    onOpenEditar();
  };

  const handleEnviarEdicao = async (e) => {
    e.preventDefault();
    try {
      await EditarAssunto(selectedAssunto.id, editFormData);
      addToast({
        title: "Assunto editado",
        description: "O assunto foi editado com sucesso.",
        color: "success",
      });
      fetchAssuntos();
    } catch (error) {
      addToast({
        title: "Erro ao editar assunto",
        description: error.message,
        color: "danger",
      });
    } finally {
      onCloseEditar();
    }
  };

  const handleDeletarAssunto = async (id) => {
    try {
      await DeletarAssunto(id);
      addToast({
        title: "Assunto deletado",
        description: "O assunto foi deletado com sucesso.",
        color: "success",
      });
      fetchAssuntos();
    } catch (error) {
      addToast({
        title: "Erro ao deletar assunto",
        description: error.message,
        color: "danger",
      });
    }
  };

  useEffect(() => {
    fetchAssuntos();
    fetchModulos();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-5 p-5">
      <Card radius="sm">
        <CardBody>
          <div className="w-full flex justify-between items-center">
            <h1 className="text-gray-700 text-3xl font-sans">Assuntos</h1>
            <div className="flex gap-2">
              <Tooltip content="Recarregar">
                <Button
                  isIconOnly
                  radius="sm"
                  color="default"
                  variant="faded"
                  isLoading={loading}
                  onPress={fetchAssuntos}
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
                Cadastrar Novo Assunto
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      <Table
        radius="sm"
        aria-label="Tabela de assuntos"
        isStriped
        isCompact
        selectionMode="single"
        color="warning"
      >
        <TableHeader>
          <TableColumn>TIPO DE ASSUNTO</TableColumn>
          <TableColumn>MÓDULO</TableColumn>
          <TableColumn>DESCRIÇÃO</TableColumn>
          <TableColumn>AÇÕES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Nenhum assunto encontrado">
          {assuntos.map((assunto) => (
            <TableRow key={assunto.id}>
              <TableCell>{assunto.tipoAssunto}</TableCell>
              <TableCell>{assunto.nomeModulo}</TableCell>
              <TableCell>{assunto.descricao}</TableCell>
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
                        onPress={() => handleEditarAssunto(assunto)}
                        className="justify-start"
                      >
                        Editar assunto
                      </Button>
                      <Button
                        radius="sm"
                        color="danger"
                        variant="flat"
                        size="sm"
                        startContent={<Icon path={mdiDelete} size={0.7} />}
                        onPress={() => handleDeletarAssunto(assunto.id)}
                        className="justify-start"
                      >
                        Deletar assunto
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal Criar Assunto */}
      <Modal radius="sm" isOpen={isOpenCriar} onOpenChange={onOpenChangeCriar}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Cadastrar novo assunto
              </ModalHeader>
              <ModalBody>
                <Form id="form-new-assunto" onSubmit={handleCriarAssunto}>
                  <Input
                    isRequired
                    radius="sm"
                    label="Tipo de Assunto"
                    placeholder="Digite o tipo de assunto"
                    value={formData.tipoAssunto}
                    onChange={(e) =>
                      setFormData({ ...formData, tipoAssunto: e.target.value })
                    }
                  />
                  <Select
                    isRequired
                    radius="sm"
                    label="Módulo"
                    placeholder="Selecione um módulo"
                    selectedKeys={formData.moduloId ? [formData.moduloId] : []}
                    onSelectionChange={(keys) => {
                      const moduloId = Array.from(keys)[0];
                      setFormData({ ...formData, moduloId });
                    }}
                  >
                    {modulos.map((modulo) => (
                      <SelectItem key={modulo.id.toString()} value={modulo.id}>
                        {modulo.nomeModulo}
                      </SelectItem>
                    ))}
                  </Select>
                  <Textarea
                    isRequired
                    radius="sm"
                    label="Descrição"
                    placeholder="Digite a descrição do assunto"
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                  />
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
                  form="form-new-assunto"
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

      {/* Modal Editar Assunto */}
      <Modal
        radius="sm"
        isOpen={isOpenEditar}
        onOpenChange={onOpenChangeEditar}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Editar assunto
              </ModalHeader>
              <ModalBody>
                <Form id="form-edit-assunto" onSubmit={handleEnviarEdicao}>
                  <Input
                    isRequired
                    radius="sm"
                    label="Tipo de Assunto"
                    placeholder="Digite o tipo de assunto"
                    value={editFormData.tipoAssunto}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        tipoAssunto: e.target.value,
                      })
                    }
                  />
                  <Select
                    isRequired
                    radius="sm"
                    label="Módulo"
                    placeholder="Selecione um módulo"
                    selectedKeys={
                      editFormData.moduloId ? [editFormData.moduloId] : []
                    }
                    onSelectionChange={(keys) => {
                      const moduloId = Array.from(keys)[0];
                      setEditFormData({ ...editFormData, moduloId });
                    }}
                  >
                    {modulos.map((modulo) => (
                      <SelectItem key={modulo.id.toString()} value={modulo.id}>
                        {modulo.nomeModulo}
                      </SelectItem>
                    ))}
                  </Select>
                  <Textarea
                    isRequired
                    radius="sm"
                    label="Descrição"
                    placeholder="Digite a descrição do assunto"
                    value={editFormData.descricao}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        descricao: e.target.value,
                      })
                    }
                  />
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
                  form="form-edit-assunto"
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

export default Assuntos;
