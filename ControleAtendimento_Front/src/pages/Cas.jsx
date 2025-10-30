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
  Cas as GetCas,
  CadastrarCa,
  EditarCa,
  DeletarCa,
} from "../service/service";
import Icon from "@mdi/react";
import {
  mdiBlockHelper,
  mdiDelete,
  mdiPencil,
  mdiRefresh,
  mdiDotsVertical,
} from "@mdi/js";
import { maskPhone, maskCNPJ } from "../utils/masks";

function Cas() {
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
  const [cas, setCas] = useState([]);
  const [selectedCa, setSelectedCa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigoCa: "",
    nomeCa: "",
    cidade: "",
    uf: "",
    telefone: "",
    email: "",
    responsavel: "",
  });
  const [editFormData, setEditFormData] = useState({
    codigoCa: "",
    nomeCa: "",
    cidade: "",
    uf: "",
    telefone: "",
    email: "",
    responsavel: "",
  });

  const fetchCas = async () => {
    setLoading(true);
    try {
      const response = await GetCas();
      setCas(response.dados);
    } catch (error) {
      addToast({
        title: "Erro ao buscar CAs",
        description: error.message,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCriarCa = async (e) => {
    e.preventDefault();
    try {
      await CadastrarCa(formData);
      addToast({
        title: "CA criado",
        description: "O CA foi criado com sucesso.",
        color: "success",
      });
      fetchCas();
      setFormData({
        codigoCa: "",
        nomeCa: "",
        cnpj: "",
        cidade: "",
        uf: "",
        telefone: "",
        email: "",
        responsavel: "",
      });
    } catch (error) {
      addToast({
        title: "Erro ao criar CA",
        description: error.message,
        color: "danger",
      });
    } finally {
      onCloseCriar();
    }
  };

  const handleEditarCa = (ca) => {
    setSelectedCa(ca);
    setEditFormData({
      codigoCa: ca.codigoCa,
      nomeCa: ca.nomeCa,
      cnpj: ca.cnpj,
      cidade: ca.cidade,
      uf: ca.uf,
      telefone: ca.telefone,
      email: ca.email,
      responsavel: ca.responsavel,
    });
    onOpenEditar();
  };

  const handleDeletarCa = async (id) => {
    try {
      await DeletarCa(id);
      addToast({
        title: "CA deletado",
        description: "O CA foi deletado com sucesso.",
        color: "success",
      });
      fetchCas();
    } catch (error) {
      addToast({
        title: "Erro ao deletar CA",
        description: error.response.data.message,
        color: "danger",
      });
    }
  };

  const handleEnviarEdicao = async (e) => {
    e.preventDefault();
    try {
      await EditarCa(selectedCa.id, editFormData);
      console.log(editFormData);

      addToast({
        title: "CA editado",
        description: "O CA foi editado com sucesso.",
        color: "success",
      });
      fetchCas();
    } catch (error) {
      addToast({
        title: "Erro ao editar CA",
        description: error.message,
        color: "danger",
      });
    } finally {
      onCloseEditar();
    }
  };

  useEffect(() => {
    fetchCas();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-5 p-5">
      <Card radius="sm">
        <CardBody>
          <div className="w-full flex justify-between items-center">
            <h1 className="text-gray-700 text-3xl font-sans">CAs</h1>
            <div className="flex gap-2">
              <Tooltip content="Recarregar">
                <Button
                  isIconOnly
                  radius="sm"
                  color="default"
                  variant="faded"
                  isLoading={loading}
                  onPress={fetchCas}
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
                Cadastrar Novo CA
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      <Table
        radius="sm"
        aria-label="Tabela de CAs"
        isStriped
        isCompact
        selectionMode="single"
        color="warning"
      >
        <TableHeader>
          <TableColumn>CÓDIGO</TableColumn>
          <TableColumn>NOME</TableColumn>
          <TableColumn>CIDADE/UF</TableColumn>
          <TableColumn>TELEFONE</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>RESPONSÁVEL</TableColumn>
          <TableColumn>AÇÕES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Nenhum CA encontrado">
          {cas.map((ca) => (
            <TableRow key={ca.id}>
              <TableCell>{ca.codigoCa}</TableCell>
              <TableCell>{ca.nomeCa}</TableCell>
              <TableCell>
                {ca.cidade && ca.uf ? `${ca.cidade}/${ca.uf}` : "N/A"}
              </TableCell>
              <TableCell>
                {ca.telefone ? maskPhone(ca.telefone) : "N/A"}
              </TableCell>
              <TableCell>{ca.email || "N/A"}</TableCell>
              <TableCell>{ca.responsavel || "N/A"}</TableCell>
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
                        onPress={() => handleEditarCa(ca)}
                        className="justify-start"
                      >
                        Editar CA
                      </Button>
                      <Button
                        radius="sm"
                        color="danger"
                        variant="flat"
                        size="sm"
                        startContent={<Icon path={mdiDelete} size={0.7} />}
                        onPress={() => handleDeletarCa(ca.id)}
                        className="justify-start"
                      >
                        Deletar CA
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
                Cadastrar novo CA
              </ModalHeader>
              <ModalBody>
                <Form id="form-new-ca" onSubmit={handleCriarCa}>
                  <Input
                    isRequired
                    radius="sm"
                    label="Código do CA"
                    placeholder="Digite o código do CA"
                    value={formData.codigoCa}
                    onChange={(e) =>
                      setFormData({ ...formData, codigoCa: e.target.value })
                    }
                  />
                  <Input
                    isRequired
                    radius="sm"
                    label="Nome do CA"
                    placeholder="Digite o nome do CA"
                    value={formData.nomeCa}
                    onChange={(e) =>
                      setFormData({ ...formData, nomeCa: e.target.value })
                    }
                  />
                  <Input
                    isRequired
                    radius="sm"
                    label="Cidade"
                    placeholder="Digite a cidade"
                    value={formData.cidade}
                    onChange={(e) =>
                      setFormData({ ...formData, cidade: e.target.value })
                    }
                  />
                  <Input
                    isRequired
                    radius="sm"
                    label="UF"
                    placeholder="Ex: SP"
                    maxLength={2}
                    value={formData.uf}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        uf: e.target.value.toUpperCase(),
                      })
                    }
                  />
                  <Input
                    isRequired
                    radius="sm"
                    label="Telefone"
                    placeholder="(00) 00000-0000"
                    value={maskPhone(formData.telefone)}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                  />
                  <Input
                    isRequired
                    radius="sm"
                    label="Email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <Input
                    isRequired
                    radius="sm"
                    label="Responsável"
                    placeholder="Nome do responsável"
                    value={formData.responsavel}
                    onChange={(e) =>
                      setFormData({ ...formData, responsavel: e.target.value })
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
                  form="form-new-ca"
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
                Editar CA
              </ModalHeader>
              <ModalBody>
                <Form id="form-edit-ca" onSubmit={handleEnviarEdicao}>
                  <Input
                    isRequired
                    radius="sm"
                    label="Código do CA"
                    placeholder="Digite o código do CA"
                    value={editFormData.codigoCa}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        codigoCa: e.target.value,
                      })
                    }
                  />
                  <Input
                    isRequired
                    radius="sm"
                    label="Nome do CA"
                    placeholder="Digite o nome do CA"
                    value={editFormData.nomeCa}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        nomeCa: e.target.value,
                      })
                    }
                  />
                  <Input
                    isRequired
                    radius="sm"
                    label="Cidade"
                    placeholder="Digite a cidade"
                    value={editFormData.cidade}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        cidade: e.target.value,
                      })
                    }
                  />
                  <Input
                    isRequired
                    radius="sm"
                    label="UF"
                    placeholder="Ex: SP"
                    maxLength={2}
                    value={editFormData.uf}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        uf: e.target.value.toUpperCase(),
                      })
                    }
                  />
                  <Input
                    isRequired
                    radius="sm"
                    label="Telefone"
                    placeholder="(00) 00000-0000"
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
                  <Input
                    isRequired
                    radius="sm"
                    label="Email"
                    type="email"
                    placeholder="email@exemplo.com"
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
                    label="Responsável"
                    placeholder="Nome do responsável"
                    value={editFormData.responsavel}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        responsavel: e.target.value,
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
                  form="form-edit-ca"
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

export default Cas;
