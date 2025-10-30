import {
  addToast,
  Button,
  Card,
  CardBody,
  Checkbox,
  Chip,
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
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useState } from "react";
import {
  GetUsuarios,
  UsuarioCreate,
  EditarUsuario,
  DeletarUsuario,
  ReativarUsuario,
  AlterarSenhaUsuario,
} from "../service/service";
import Icon from "@mdi/react";
import {
  mdiBlockHelper,
  mdiDelete,
  mdiPencil,
  mdiRefresh,
  mdiKey,
  mdiDotsVertical,
} from "@mdi/js";
import { maskPhone } from "../utils/masks";

function Usuarios() {
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
    isOpen: isOpenSenha,
    onOpen: onOpenSenha,
    onClose: onCloseSenha,
    onOpenChange: onOpenChangeSenha,
  } = useDisclosure();
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [formData, setFormData] = useState({
    nomeUsuario: "",
    email: "",
    senha: "",
    telefone: "",
    cargo: "USUARIO",
    isAdmin: false,
  });
  const [editFormData, setEditFormData] = useState({
    nomeUsuario: "",
    email: "",
    telefone: "",
    cargo: "USUARIO",
    isAdmin: false,
  });

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await GetUsuarios();
      setUsuarios(response.dados);
    } catch (error) {
      addToast({
        title: "Erro ao buscar usuários",
        description: error.message,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCriarUsuario = async (e) => {
    e.preventDefault();
    if (formData.senha.length < 8) {
      addToast({
        title: "Erro ao criar usuário",
        description: "A senha deve ter no mínimo 8 caracteres.",
        color: "danger",
      });
      return;
    }
    if (!formData.email.endsWith("@exactus.com")) {
      addToast({
        title: "Erro ao criar usuário",
        description: "O email deve ser do domínio @exactus.com",
        color: "danger",
      });
      return;
    }
    try {
      await UsuarioCreate(formData);
      addToast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Erro ao criar usuário",
        description: error.message,
        color: "danger",
      });
    } finally {
      onCloseCriar();
    }
  };

  const handleEditarUsuario = (usuario) => {
    setSelectedUser(usuario);
    setEditFormData({
      nomeUsuario: usuario.nomeUsuario,
      email: usuario.email,
      telefone: usuario.telefone,
      cargo: usuario.isAdmin ? "ADM" : "USUARIO",
      isAdmin: usuario.isAdmin,
    });
    onOpenEditar();
  };

  const handleReativarUsuario = async (id) => {
    try {
      await ReativarUsuario(id);
      addToast({
        title: "Usuário reativado",
        description: "O usuário foi reativado com sucesso.",
        color: "success",
      });
      fetchUsuarios();
    } catch (error) {
      addToast({
        title: "Erro ao reativar usuário",
        description: error.message,
        color: "danger",
      });
    }
  };

  const handleDeletarUsuario = async (id) => {
    try {
      await DeletarUsuario(id);
      addToast({
        title: "Usuário desativado",
        description: "O usuário foi desativado com sucesso.",
        color: "success",
      });
      fetchUsuarios();
    } catch (error) {
      addToast({
        title: "Erro ao desativar usuário",
        description: error.message,
        color: "danger",
      });
    }
  };

  const handleEnviarEdicao = async (e) => {
    e.preventDefault();
    try {
      await EditarUsuario(selectedUser.id, editFormData);
      addToast({
        title: "Usuário editado",
        description: "O usuário foi editado com sucesso.",
        color: "success",
      });
      fetchUsuarios();
    } catch (error) {
      addToast({
        title: "Erro ao editar usuário",
        description: error.message,
        color: "danger",
      });
    } finally {
      onCloseEditar();
    }
  };

  const handleAbrirModalSenha = (usuario) => {
    setSelectedUser(usuario);
    setNovaSenha("");
    onOpenSenha();
  };

  const handleAlterarSenha = async (e) => {
    e.preventDefault();
    if (novaSenha.length < 8) {
      addToast({
        title: "Erro ao alterar senha",
        description: "A senha deve ter no mínimo 8 caracteres.",
        color: "danger",
      });
      return;
    }
    try {
      await AlterarSenhaUsuario(selectedUser.id, novaSenha);
      addToast({
        title: "Senha alterada",
        description: "A senha do usuário foi alterada com sucesso.",
        color: "success",
      });
      setNovaSenha("");
      onCloseSenha();
    } catch (error) {
      addToast({
        title: "Erro ao alterar senha",
        description: error.message,
        color: "danger",
      });
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (formData.cargo === "ADM") {
      setFormData({ ...formData, isAdmin: true });
    }
  }, [formData.cargo]);

  useEffect(() => {
    if (editFormData.cargo === "ADM") {
      setEditFormData({ ...editFormData, isAdmin: true });
    } else {
      setEditFormData({ ...editFormData, isAdmin: false });
    }
  }, [editFormData.cargo]);

  return (
    <div className="w-full h-full flex flex-col gap-5 p-5">
      <Card radius="sm">
        <CardBody>
          <div className="w-full flex justify-between items-center">
            <h1 className="text-gray-700 text-3xl font-sans">Usuários</h1>
            <div className="flex gap-2">
              <Tooltip content="Recarregar">
                <Button
                  isIconOnly
                  radius="sm"
                  color="default"
                  variant="faded"
                  isLoading={loading}
                  onPress={fetchUsuarios}
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
                Cadastrar Novo Usuário
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      <Table
        radius="sm"
        aria-label="Example static collection table"
        isStriped
        isCompact
        selectionMode="single"
        color="warning"
      >
        <TableHeader>
          <TableColumn>NOME</TableColumn>
          <TableColumn>CARGO</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>TELEFONE</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>AÇÕES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Nenhum usuário encontrado">
          {usuarios.map((usuario) => (
            <TableRow key={usuario.id}>
              <TableCell>{usuario.nomeUsuario}</TableCell>
              <TableCell>
                {usuario.isAdmin === true ? "Administrador" : "Usuário"}
              </TableCell>
              <TableCell>{usuario.email}</TableCell>
              <TableCell>
                {usuario.telefone ? maskPhone(usuario.telefone) : "N/A"}
              </TableCell>
              <TableCell>
                <Chip
                  color={usuario.isActive === true ? "success" : "danger"}
                  variant="flat"
                  size="sm"
                  radius="sm"
                >
                  {usuario.isActive === true ? "Ativo" : "Inativo"}
                </Chip>
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
                        onPress={() => handleEditarUsuario(usuario)}
                        className="justify-start"
                      >
                        Editar usuário
                      </Button>
                      <Button
                        radius="sm"
                        color="warning"
                        variant="flat"
                        size="sm"
                        startContent={<Icon path={mdiKey} size={0.7} />}
                        onPress={() => handleAbrirModalSenha(usuario)}
                        className="justify-start"
                      >
                        Alterar senha
                      </Button>
                      {usuario.isActive === true ? (
                        <Button
                          radius="sm"
                          color="danger"
                          variant="flat"
                          size="sm"
                          startContent={
                            <Icon path={mdiBlockHelper} size={0.7} />
                          }
                          onPress={() => handleDeletarUsuario(usuario.id)}
                          className="justify-start"
                        >
                          Desativar usuário
                        </Button>
                      ) : (
                        <Button
                          radius="sm"
                          color="success"
                          variant="flat"
                          size="sm"
                          startContent={<Icon path={mdiRefresh} size={0.7} />}
                          onPress={() => handleReativarUsuario(usuario.id)}
                          className="justify-start"
                        >
                          Reativar usuário
                        </Button>
                      )}
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
                Cadastrar novo usuário
              </ModalHeader>
              <ModalBody>
                <Form id="form-new-user" onSubmit={handleCriarUsuario}>
                  <Input
                    isRequired
                    radius="sm"
                    placeholder="Nome do usuário"
                    value={formData.nomeUsuario}
                    onChange={(e) =>
                      setFormData({ ...formData, nomeUsuario: e.target.value })
                    }
                  />
                  <Input
                    isRequired
                    radius="sm"
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <Input
                    isRequired
                    radius="sm"
                    placeholder="Senha"
                    value={formData.senha}
                    onChange={(e) =>
                      setFormData({ ...formData, senha: e.target.value })
                    }
                  />
                  <Input
                    isRequired
                    radius="sm"
                    placeholder="Telefone"
                    value={maskPhone(formData.telefone)}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                  />
                  <Select
                    isRequired
                    radius="sm"
                    defaultSelectedKeys={[formData.cargo]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, cargo: value })
                    }
                  >
                    <SelectItem key={"USUARIO"}>USUARIO</SelectItem>
                    <SelectItem key={"ADM"}>ADM</SelectItem>
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
                  form="form-new-user"
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
                Editar usuário
              </ModalHeader>
              <ModalBody>
                <Form id="form-edit-user" onSubmit={handleEnviarEdicao}>
                  <Input
                    isRequired
                    radius="sm"
                    placeholder="Nome do usuário"
                    value={editFormData.nomeUsuario}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        nomeUsuario: e.target.value,
                      })
                    }
                  />
                  <Input
                    isRequired
                    radius="sm"
                    placeholder="Email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                  />

                  <Input
                    isRequired
                    radius="sm"
                    placeholder="Telefone"
                    value={
                      editFormData.telefone
                        ? maskPhone(editFormData.telefone)
                        : ""
                    }
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        telefone: e.target.value,
                      })
                    }
                  />

                  <Select
                    isRequired
                    radius="sm"
                    selectedKeys={[editFormData.cargo]}
                    onSelectionChange={(keys) => {
                      const cargo = Array.from(keys)[0];
                      setEditFormData({ ...editFormData, cargo });
                    }}
                  >
                    <SelectItem key={"USUARIO"}>USUARIO</SelectItem>
                    <SelectItem key={"ADM"}>ADM</SelectItem>
                  </Select>
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
                  form="form-edit-user"
                  type="submit"
                >
                  Editar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal radius="sm" isOpen={isOpenSenha} onOpenChange={onOpenChangeSenha}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Alterar senha do usuário
              </ModalHeader>
              <ModalBody>
                {selectedUser && (
                  <p className="text-sm text-gray-600 mb-2">
                    Alterando senha de:{" "}
                    <strong>{selectedUser.nomeUsuario}</strong>
                  </p>
                )}
                <Form id="form-alterar-senha" onSubmit={handleAlterarSenha}>
                  <Input
                    isRequired
                    radius="sm"
                    label="Nova senha"
                    placeholder="Digite a nova senha"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    description="A senha deve ter no mínimo 8 caracteres"
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
                  form="form-alterar-senha"
                  color="warning"
                  variant="faded"
                  type="submit"
                >
                  Alterar Senha
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default Usuarios;
