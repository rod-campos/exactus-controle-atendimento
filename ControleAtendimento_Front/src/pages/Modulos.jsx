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
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";
import {
  Modulos as GetModulos,
  CadastrarModulo,
  EditarModulo,
  DeletarModulo,
} from "../service/service";
import Icon from "@mdi/react";
import { mdiDelete, mdiPencil, mdiRefresh, mdiDotsVertical } from "@mdi/js";

function Modulos() {
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
  const [modulos, setModulos] = useState([]);
  const [selectedModulo, setSelectedModulo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomeModulo: "",
    descricao: "",
  });
  const [editFormData, setEditFormData] = useState({
    nomeModulo: "",
    descricao: "",
  });

  const fetchModulos = async () => {
    setLoading(true);
    try {
      const response = await GetModulos();
      setModulos(response.dados);
    } catch (error) {
      addToast({
        title: "Erro ao buscar módulos",
        description: error.message,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCriarModulo = async (e) => {
    e.preventDefault();
    try {
      await CadastrarModulo(formData);
      addToast({
        title: "Módulo criado",
        description: "O módulo foi criado com sucesso.",
        color: "success",
      });
      fetchModulos();
      setFormData({
        nomeModulo: "",
        descricao: "",
      });
    } catch (error) {
      addToast({
        title: "Erro ao criar módulo",
        description: error.message,
        color: "danger",
      });
    } finally {
      onCloseCriar();
    }
  };

  const handleEditarModulo = (modulo) => {
    setSelectedModulo(modulo);
    setEditFormData({
      nomeModulo: modulo.nomeModulo,
      descricao: modulo.descricao || "",
    });
    onOpenEditar();
  };

  const handleDeletarModulo = async (id) => {
    try {
      await DeletarModulo(id);
      addToast({
        title: "Módulo deletado",
        description: "O módulo foi deletado com sucesso.",
        color: "success",
      });
      fetchModulos();
    } catch (error) {
      addToast({
        title: "Erro ao deletar módulo",
        description: error.response?.data?.message || error.message,
        color: "danger",
      });
    }
  };

  const handleEnviarEdicao = async (e) => {
    e.preventDefault();
    try {
      await EditarModulo(selectedModulo.id, editFormData);
      addToast({
        title: "Módulo editado",
        description: "O módulo foi editado com sucesso.",
        color: "success",
      });
      fetchModulos();
    } catch (error) {
      addToast({
        title: "Erro ao editar módulo",
        description: error.message,
        color: "danger",
      });
    } finally {
      onCloseEditar();
    }
  };

  useEffect(() => {
    fetchModulos();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-5 p-5">
      <Card radius="sm">
        <CardBody>
          <div className="w-full flex justify-between items-center">
            <h1 className="text-gray-700 text-3xl font-sans">Módulos</h1>
            <div className="flex gap-2">
              <Tooltip content="Recarregar">
                <Button
                  isIconOnly
                  radius="sm"
                  color="default"
                  variant="faded"
                  isLoading={loading}
                  onPress={fetchModulos}
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
                Cadastrar Novo Módulo
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      <Table
        radius="sm"
        aria-label="Tabela de Módulos"
        isStriped
        isCompact
        selectionMode="single"
        color="warning"
      >
        <TableHeader>
          <TableColumn>NOME</TableColumn>
          <TableColumn>DESCRIÇÃO</TableColumn>
          <TableColumn>TOTAL ASSUNTOS</TableColumn>
          <TableColumn>AÇÕES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Nenhum módulo encontrado">
          {modulos.map((modulo) => (
            <TableRow key={modulo.id}>
              <TableCell>{modulo.nomeModulo}</TableCell>
              <TableCell>{modulo.descricao || "N/A"}</TableCell>
              <TableCell>{modulo.totalAssuntos || 0}</TableCell>
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
                        onPress={() => handleEditarModulo(modulo)}
                        className="justify-start"
                      >
                        Editar módulo
                      </Button>
                      <Button
                        radius="sm"
                        color="danger"
                        variant="flat"
                        size="sm"
                        startContent={<Icon path={mdiDelete} size={0.7} />}
                        onPress={() => handleDeletarModulo(modulo.id)}
                        className="justify-start"
                      >
                        Deletar módulo
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal radius="sm" isOpen={isOpenCriar} onOpenChange={onOpenChangeCriar}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Cadastrar novo módulo
              </ModalHeader>
              <ModalBody>
                <Form id="form-new-modulo" onSubmit={handleCriarModulo}>
                  <Input
                    isRequired
                    radius="sm"
                    label="Nome do Módulo"
                    placeholder="Digite o nome do módulo"
                    value={formData.nomeModulo}
                    onChange={(e) =>
                      setFormData({ ...formData, nomeModulo: e.target.value })
                    }
                  />
                  <Input
                    radius="sm"
                    label="Descrição"
                    placeholder="Digite a descrição do módulo (opcional)"
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
                  form="form-new-modulo"
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
      <Modal isOpen={isOpenEditar} onOpenChange={onOpenChangeEditar}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Editar módulo
              </ModalHeader>
              <ModalBody>
                <Form id="form-edit-modulo" onSubmit={handleEnviarEdicao}>
                  <Input
                    isRequired
                    radius="sm"
                    label="Nome do Módulo"
                    placeholder="Digite o nome do módulo"
                    value={editFormData.nomeModulo}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        nomeModulo: e.target.value,
                      })
                    }
                  />
                  <Input
                    radius="sm"
                    label="Descrição"
                    placeholder="Digite a descrição do módulo (opcional)"
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
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="warning"
                  variant="faded"
                  radius="sm"
                  form="form-edit-modulo"
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

export default Modulos;
