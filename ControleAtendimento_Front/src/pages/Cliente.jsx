import {
  Button,
  Card,
  CardBody,
  Chip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tooltip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  Select,
  SelectItem,
  addToast,
} from "@heroui/react";
import { mdiRefresh, mdiPencil, mdiDelete, mdiDotsVertical } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import {
  CadastrarCliente,
  Cas,
  Clientes,
  EditarCliente,
  DeletarCliente,
} from "../service/service";
import { maskCpfCnpj, maskPhone } from "../utils/masks";

function Cliente() {
  const {
    onOpen: onOpenCriar,
    onClose: onCloseCriar,
    isOpen: isOpenCriar,
    onOpenChange: onOpenChangeCriar,
  } = useDisclosure();
  const {
    isOpen: isOpenEditar,
    onOpen: onOpenEditar,
    onClose: onCloseEditar,
    onOpenChange: onOpenChangeEditar,
  } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [cas, setCas] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [formData, setFormData] = useState({});
  const [editFormData, setEditFormData] = useState({});

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

  const fetchCas = async () => {
    try {
      const response = await Cas();
      setCas(response.dados);
      console.log(response);
    } catch (error) {
      console.error("Erro ao buscar CAs:", error);
    }
  };

  const handleCriarCliente = async (e) => {
    e.preventDefault();
    try {
      await CadastrarCliente(formData);
      addToast({
        title: "Sucesso",
        description: "Cliente criado com sucesso",
        color: "success",
      });
      onCloseCriar();
      fetchClientes();
      setFormData({});
    } catch (error) {
      addToast({
        title: "Erro",
        description: "Erro ao criar cliente",
        color: "danger",
      });
    }
  };

  const handleEditarCliente = (cliente) => {
    setSelectedCliente(cliente);
    setEditFormData({
      codigoCliente: cliente.codigoCliente,
      caId: cliente.caId.toString(),
      nomeCliente: cliente.nomeCliente,
      razaoSocial: cliente.razaoSocial,
      cnpjCpf: cliente.cnpjCpf,
      cidade: cliente.cidade,
      uf: cliente.uf,
      telefone: cliente.telefone,
      email: cliente.email,
      responsavel: cliente.responsavel,
      statusCliente: cliente.statusCliente,
    });
    onOpenEditar();
  };

  const handleDeletarCliente = async (id) => {
    try {
      await DeletarCliente(id);
      addToast({
        title: "Cliente deletado",
        description: "O cliente foi deletado com sucesso.",
        color: "success",
      });
      fetchClientes(); // Recarregar a lista de clientes
    } catch (error) {
      addToast({
        title: "Erro ao deletar cliente",
        description: error.response.data.message,
        color: "danger",
      });
    }
  };

  const handleEnviarEdicao = async (e) => {
    e.preventDefault();
    try {
      await EditarCliente(selectedCliente.id, editFormData);
      addToast({
        title: "Cliente editado",
        description: "O cliente foi editado com sucesso.",
        color: "success",
      });
      fetchClientes(); // Recarregar a lista de clientes
    } catch (error) {
      addToast({
        title: "Erro ao editar cliente",
        description: error.message,
        color: "danger",
      });
    } finally {
      onCloseEditar();
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    fetchCas();
  }, [isOpenCriar, isOpenEditar]);
  return (
    <div className="w-full h-full flex flex-col gap-5 p-5">
      <Card radius="sm">
        <CardBody>
          <div className="w-full flex justify-between items-center">
            <h1 className="text-gray-700 text-3xl font-sans">Clientes</h1>
            <div className="flex gap-2">
              <Tooltip content="Recarregar">
                <Button
                  isIconOnly
                  radius="sm"
                  color="default"
                  variant="faded"
                  isLoading={loading}
                  onPress={fetchClientes}
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
                Cadastrar Novo Cliente
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      <Table
        radius="sm"
        aria-label="Tabela de clientes"
        isStriped
        isCompact
        selectionMode="single"
        color="warning"
      >
        <TableHeader>
          <TableColumn>CÓDIGO</TableColumn>
          <TableColumn>NOME CLIENTE</TableColumn>
          <TableColumn>CIDADE</TableColumn>
          <TableColumn>UF</TableColumn>
          <TableColumn>CA</TableColumn>
          <TableColumn>ATENDIMENTOS</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>AÇÕES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Nenhum cliente encontrado">
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell>{cliente.codigoCliente}</TableCell>
              <TableCell>{cliente.nomeCliente}</TableCell>
              <TableCell>{cliente.cidade || "N/A"}</TableCell>
              <TableCell>{cliente.uf || "N/A"}</TableCell>
              <TableCell>{cliente.nomeCa}</TableCell>
              <TableCell>{cliente.totalAtendimentos}</TableCell>
              <TableCell>
                <Chip
                  color={
                    cliente.statusCliente === "ATIVO" ? "success" : "default"
                  }
                  variant="flat"
                  size="sm"
                  radius="sm"
                >
                  {cliente.statusCliente}
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
                        onPress={() => handleEditarCliente(cliente)}
                        className="justify-start"
                      >
                        Editar cliente
                      </Button>
                      <Button
                        radius="sm"
                        color="danger"
                        variant="flat"
                        size="sm"
                        startContent={<Icon path={mdiDelete} size={0.7} />}
                        onPress={() => handleDeletarCliente(cliente.id)}
                        className="justify-start"
                      >
                        Deletar cliente
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
                Cadastrar novo cliente
              </ModalHeader>
              <ModalBody>
                <Form id="form-new-cliente" onSubmit={handleCriarCliente}>
                  <Input
                    isRequired
                    radius="sm"
                    placeholder="Responsável"
                    value={formData.responsavel}
                    onChange={(e) =>
                      setFormData({ ...formData, responsavel: e.target.value })
                    }
                  />
                  <div className="w-full flex gap-2">
                    <Input
                      isRequired
                      radius="sm"
                      placeholder="Codigo do cliente"
                      value={formData.codigoCliente}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          codigoCliente: e.target.value,
                        })
                      }
                    />

                    <Select
                      isRequired
                      radius="sm"
                      placeholder="Selecione o CA"
                      selectedKeys={formData.caId ? [formData.caId] : []}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setFormData({ ...formData, caId: value });
                      }}
                    >
                      {cas.map((ca) => (
                        <SelectItem key={ca.id}>{ca.nomeCa}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  <Input
                    isRequired
                    radius="sm"
                    placeholder="Nome Cliente"
                    value={formData.nomeCliente}
                    onChange={(e) =>
                      setFormData({ ...formData, nomeCliente: e.target.value })
                    }
                  />
                  <div className="w-full flex gap-2">
                    <Input
                      isRequired
                      radius="sm"
                      placeholder="Razão Social"
                      value={formData.razaoSocial}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          razaoSocial: e.target.value,
                        })
                      }
                    />
                    <Input
                      isRequired
                      radius="sm"
                      placeholder="CNPJ/CPF"
                      value={
                        formData.cnpjCpf ? maskCpfCnpj(formData.cnpjCpf) : ""
                      }
                      maxLength={18}
                      minLength={14}
                      onChange={(e) =>
                        setFormData({ ...formData, cnpjCpf: e.target.value })
                      }
                    />
                  </div>

                  <div className="w-full flex gap-2">
                    <Input
                      className="w-1/4"
                      isRequired
                      radius="sm"
                      placeholder="UF"
                      value={formData.uf ? formData.uf.toUpperCase() : ""}
                      maxLength={2}
                      onChange={(e) =>
                        setFormData({ ...formData, uf: e.target.value })
                      }
                    />
                    <Input
                      isRequired
                      radius="sm"
                      placeholder="Cidade"
                      value={formData.cidade}
                      onChange={(e) =>
                        setFormData({ ...formData, cidade: e.target.value })
                      }
                    />
                  </div>

                  <div className="w-full flex gap-2">
                    <Input
                      isRequired
                      radius="sm"
                      placeholder="Telefone"
                      value={
                        formData.telefone ? maskPhone(formData.telefone) : ""
                      }
                      maxLength={15}
                      onChange={(e) =>
                        setFormData({ ...formData, telefone: e.target.value })
                      }
                    />
                    <Select
                      className="w-1/2"
                      isRequired
                      radius="sm"
                      placeholder="Selecione o Status"
                      selectedKeys={
                        formData.statusCliente ? [formData.statusCliente] : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setFormData({ ...formData, statusCliente: value });
                      }}
                    >
                      <SelectItem key="ATIVO">ATIVO</SelectItem>
                      <SelectItem key="INATIVO">INATIVO</SelectItem>
                    </Select>
                  </div>

                  <Input
                    isRequired
                    radius="sm"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
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
                  form="form-new-cliente"
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

      <Modal
        radius="sm"
        isOpen={isOpenEditar}
        onOpenChange={onOpenChangeEditar}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Editar cliente
              </ModalHeader>
              <ModalBody>
                <Form id="form-edit-cliente" onSubmit={handleEnviarEdicao}>
                  <Input
                    isRequired
                    radius="sm"
                    placeholder="Responsável"
                    value={editFormData.responsavel}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        responsavel: e.target.value,
                      })
                    }
                  />
                  <div className="w-full flex gap-2">
                    <Input
                      isRequired
                      radius="sm"
                      placeholder="Codigo do cliente"
                      value={editFormData.codigoCliente}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          codigoCliente: e.target.value,
                        })
                      }
                    />

                    <Select
                      isRequired
                      radius="sm"
                      placeholder="Selecione o CA"
                      selectedKeys={
                        editFormData.caId ? [editFormData.caId] : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setEditFormData({ ...editFormData, caId: value });
                      }}
                    >
                      {cas.map((ca) => (
                        <SelectItem key={ca.id.toString()}>
                          {ca.nomeCa}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  <Input
                    isRequired
                    radius="sm"
                    placeholder="Nome Cliente"
                    value={editFormData.nomeCliente}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        nomeCliente: e.target.value,
                      })
                    }
                  />
                  <div className="w-full flex gap-2">
                    <Input
                      isRequired
                      radius="sm"
                      placeholder="Razão Social"
                      value={editFormData.razaoSocial}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          razaoSocial: e.target.value,
                        })
                      }
                    />
                    <Input
                      isRequired
                      radius="sm"
                      placeholder="CNPJ/CPF"
                      value={
                        editFormData.cnpjCpf
                          ? maskCpfCnpj(editFormData.cnpjCpf)
                          : ""
                      }
                      maxLength={18}
                      minLength={14}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          cnpjCpf: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="w-full flex gap-2">
                    <Input
                      className="w-1/4"
                      isRequired
                      radius="sm"
                      placeholder="UF"
                      value={
                        editFormData.uf ? editFormData.uf.toUpperCase() : ""
                      }
                      maxLength={2}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, uf: e.target.value })
                      }
                    />
                    <Input
                      isRequired
                      radius="sm"
                      placeholder="Cidade"
                      value={editFormData.cidade}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          cidade: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="w-full flex gap-2">
                    <Input
                      isRequired
                      radius="sm"
                      placeholder="Telefone"
                      value={
                        editFormData.telefone
                          ? maskPhone(editFormData.telefone)
                          : ""
                      }
                      maxLength={15}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          telefone: e.target.value,
                        })
                      }
                    />
                    <Select
                      className="w-1/2"
                      isRequired
                      radius="sm"
                      placeholder="Selecione o Status"
                      selectedKeys={
                        editFormData.statusCliente
                          ? [editFormData.statusCliente]
                          : []
                      }
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0];
                        setEditFormData({
                          ...editFormData,
                          statusCliente: value,
                        });
                      }}
                    >
                      <SelectItem key="ATIVO">ATIVO</SelectItem>
                      <SelectItem key="INATIVO">INATIVO</SelectItem>
                    </Select>
                  </div>

                  <Input
                    isRequired
                    radius="sm"
                    placeholder="Email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
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
                  form="form-edit-cliente"
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

export default Cliente;
