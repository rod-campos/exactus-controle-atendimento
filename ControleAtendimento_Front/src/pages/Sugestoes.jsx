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
  Textarea,
  Tooltip,
  useDisclosure,
  Chip,
} from "@heroui/react";
import { useEffect, useState } from "react";
import {
  Sugestoes as GetSugestoes,
  MarcarSugestaoComoLida,
  DeletarSugestao,
} from "../service/service";
import Icon from "@mdi/react";
import {
  mdiDelete,
  mdiEye,
  mdiEyeOff,
  mdiRefresh,
  mdiDotsVertical,
} from "@mdi/js";

function Sugestoes() {
  const {
    isOpen: isOpenDetalhes,
    onOpen: onOpenDetalhes,
    onClose: onCloseDetalhes,
    onOpenChange: onOpenChangeDetalhes,
  } = useDisclosure();
  const [sugestoes, setSugestoes] = useState([]);
  const [selectedSugestao, setSelectedSugestao] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSugestoes = async () => {
    setLoading(true);
    try {
      const response = await GetSugestoes();
      setSugestoes(response.dados);
    } catch (error) {
      addToast({
        title: "Erro ao buscar sugestões",
        description: error.message,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVisualizarSugestao = (sugestao) => {
    setSelectedSugestao(sugestao);
    onOpenDetalhes();
  };

  const handleMarcarComoLida = async (id) => {
    try {
      await MarcarSugestaoComoLida(id);
      addToast({
        title: "Marcada como lida",
        description: "A sugestão foi marcada como lida.",
        color: "success",
      });
      fetchSugestoes();
    } catch (error) {
      addToast({
        title: "Erro ao atualizar sugestão",
        description: error.response?.data?.message || error.message,
        color: "danger",
      });
    }
  };

  const handleDeletarSugestao = async (id) => {
    try {
      await DeletarSugestao(id);
      addToast({
        title: "Sugestão deletada",
        description: "A sugestão foi deletada com sucesso.",
        color: "success",
      });
      fetchSugestoes();
    } catch (error) {
      addToast({
        title: "Erro ao deletar sugestão",
        description: error.response?.data?.message || error.message,
        color: "danger",
      });
    }
  };

  useEffect(() => {
    fetchSugestoes();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-5 p-5">
      <Card radius="sm">
        <CardBody>
          <div className="w-full flex justify-between items-center">
            <h1 className="text-gray-700 text-3xl font-sans">Sugestões</h1>
            <div className="flex gap-2">
              <Tooltip content="Recarregar">
                <Button
                  isIconOnly
                  radius="sm"
                  color="default"
                  variant="faded"
                  isLoading={loading}
                  onPress={fetchSugestoes}
                >
                  <Icon path={mdiRefresh} size={0.8} />
                </Button>
              </Tooltip>
            </div>
          </div>
        </CardBody>
      </Card>
      <Table
        radius="sm"
        aria-label="Tabela de Sugestões"
        isStriped
        isCompact
        selectionMode="single"
        color="warning"
      >
        <TableHeader>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>TÍTULO</TableColumn>
          <TableColumn>USUÁRIO</TableColumn>
          <TableColumn>CLIENTE</TableColumn>
          <TableColumn>CA</TableColumn>
          <TableColumn>AÇÕES</TableColumn>
        </TableHeader>
        <TableBody emptyContent="Nenhuma sugestão encontrada">
          {sugestoes.map((sugestao) => (
            <TableRow key={sugestao.id}>
              <TableCell>
                <Chip
                  size="sm"
                  variant="flat"
                  color={sugestao.isRead ? "default" : "warning"}
                >
                  {sugestao.isRead ? "Lida" : "Não lida"}
                </Chip>
              </TableCell>
              <TableCell>{sugestao.titulo}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {sugestao.nomeUsuario}
                  </span>
                  <span className="text-xs text-gray-500">
                    {sugestao.emailUsuario}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">{sugestao.nomeCliente}</span>
                  <span className="text-xs text-gray-500">
                    {sugestao.codigoCliente}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">{sugestao.nomeCa}</span>
                  <span className="text-xs text-gray-500">
                    {sugestao.codigoCa}
                  </span>
                </div>
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
                      {!sugestao.isRead ? (
                        <Button
                          radius="sm"
                          color="success"
                          variant="flat"
                          size="sm"
                          startContent={<Icon path={mdiEye} size={0.7} />}
                          onPress={() => handleMarcarComoLida(sugestao.id)}
                          className="justify-start"
                        >
                          Marcar como lida
                        </Button>
                      ) : (
                        <Button
                          radius="sm"
                          color="primary"
                          variant="flat"
                          size="sm"
                          startContent={<Icon path={mdiEye} size={0.7} />}
                          onPress={() => handleVisualizarSugestao(sugestao)}
                          className="justify-start"
                        >
                          Visualizar
                        </Button>
                      )}
                      <Button
                        radius="sm"
                        color="danger"
                        variant="flat"
                        size="sm"
                        startContent={<Icon path={mdiDelete} size={0.7} />}
                        onPress={() => handleDeletarSugestao(sugestao.id)}
                        className="justify-start"
                      >
                        Deletar sugestão
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal
        size="3xl"
        radius="sm"
        isOpen={isOpenDetalhes}
        onOpenChange={onOpenChangeDetalhes}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 shadow-md border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Detalhes da Sugestão
                </h2>
                {selectedSugestao && (
                  <div className="flex gap-2 items-center mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedSugestao.isRead
                          ? "bg-gray-100 text-gray-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {selectedSugestao.isRead ? "✓ Lida" : "📌 Não lida"}
                    </span>
                  </div>
                )}
              </ModalHeader>
              <ModalBody className="py-6">
                {selectedSugestao && (
                  <div className="flex flex-col gap-6">
                    {/* Título */}
                    {selectedSugestao.titulo && (
                      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 shadow-sm">
                        <CardBody className="py-4">
                          <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                            Título
                          </p>
                          <p className="text-lg font-semibold text-gray-800">
                            {selectedSugestao.titulo}
                          </p>
                        </CardBody>
                      </Card>
                    )}

                    {/* Informações do Usuário */}
                    <div>
                      <h3 className="text-sm uppercase tracking-wide font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-warning-500 rounded"></span>
                        Informações do Usuário
                      </h3>
                      <Card className="shadow-sm">
                        <CardBody className="py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                                👤 Nome
                              </p>
                              <p className="text-base font-medium text-gray-800">
                                {selectedSugestao.nomeUsuario}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                                📧 E-mail
                              </p>
                              <p className="text-base text-gray-700">
                                {selectedSugestao.emailUsuario}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </div>

                    {/* Informações do Atendimento */}
                    <div>
                      <h3 className="text-sm uppercase tracking-wide font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-warning-500 rounded"></span>
                        Informações do Atendimento
                      </h3>
                      <Card className="shadow-sm">
                        <CardBody className="py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                                🏢 CA
                              </p>
                              <p className="text-base font-medium text-gray-800">
                                {selectedSugestao.nomeCa}
                              </p>
                              <p className="text-sm text-gray-500">
                                {selectedSugestao.codigoCa}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-1">
                                👥 Cliente
                              </p>
                              <p className="text-base font-medium text-gray-800">
                                {selectedSugestao.nomeCliente}
                              </p>
                              <p className="text-sm text-gray-500">
                                {selectedSugestao.codigoCliente}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </div>

                    {/* Conteúdo */}
                    <div>
                      <h3 className="text-sm uppercase tracking-wide font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-warning-500 rounded"></span>
                        Conteúdo da Sugestão
                      </h3>
                      <Card className="shadow-sm">
                        <CardBody className="py-4">
                          <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {selectedSugestao.conteudo}
                          </p>
                        </CardBody>
                      </Card>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="shadow-md border-t border-gray-200 pt-4">
                <Button color="default" variant="light" onPress={onClose}>
                  Fechar
                </Button>
                {selectedSugestao && !selectedSugestao.isRead && (
                  <Button
                    color="success"
                    variant="flat"
                    radius="sm"
                    onPress={() => {
                      handleMarcarComoLida(selectedSugestao.id);
                      onClose();
                    }}
                  >
                    Marcar como lida
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default Sugestoes;
