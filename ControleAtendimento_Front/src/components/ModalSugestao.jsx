import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea,
  addToast,
} from "@heroui/react";
import { mdiLightbulbOn, mdiSend } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import {
  Cas,
  Clientes,
  EnviarSugestao,
  ClientePorCa,
} from "../service/service";

export function ModalSugestao({ isOpen, onClose, onOpenChange }) {
  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
    clienteId: "",
    caId: "",
  });
  const [cas, setCas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCas = async () => {
    try {
      const response = await Cas();
      setCas(response.dados);
    } catch (error) {
      console.error("Erro ao buscar CAs:", error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await Clientes();
      if (response && response.dados) {
        setClientes(response.dados);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const fetchClientePorCa = async (caId) => {
    try {
      const response = await ClientePorCa(caId);
      console.log("Cliente por CA (Sugestão):", response);
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
      console.error("Erro ao buscar cliente por CA (Sugestão):", error);
      setClientesFiltrados([]);
      setFormData({ ...formData, caId: caId, clienteId: "" });
    }
  };

  const handleEnviarSugestao = async () => {
    try {
      setLoading(true);
      await EnviarSugestao(formData);
      addToast({
        title: "Sucesso",
        description: "Sugestão enviada com sucesso",
        color: "success",
      });
      setFormData({
        titulo: "",
        conteudo: "",
        clienteId: "",
        caId: "",
      });
      onClose();
    } catch (error) {
      addToast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao enviar sugestão",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCas();
      fetchClientes();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onClose}
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
                    path={mdiLightbulbOn}
                    size={1.2}
                    className="text-warning-600"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Nova Sugestão
                  </h2>
                  <p className="text-sm font-normal text-gray-500">
                    Compartilhe suas ideias para melhorarmos o sistema
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
                    label="Título da Sugestão"
                    placeholder="Ex: Melhorias na interface de usuário"
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

                {/* Selects em linha */}
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
                        setClientesFiltrados([]);
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
                    isDisabled={!formData.caId || clientesFiltrados.length <= 1}
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

                {/* Conteúdo */}
                <div className="w-full">
                  <Textarea
                    isRequired
                    label="Descrição Detalhada"
                    placeholder="Descreva sua sugestão com o máximo de detalhes possível..."
                    value={formData.conteudo}
                    onChange={(e) =>
                      setFormData({ ...formData, conteudo: e.target.value })
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
                onPress={handleEnviarSugestao}
                isLoading={loading}
                isDisabled={
                  !formData.titulo ||
                  !formData.conteudo ||
                  !formData.clienteId ||
                  !formData.caId
                }
                size="lg"
                className="font-semibold"
                startContent={!loading && <Icon path={mdiSend} size={0.8} />}
              >
                Enviar Sugestão
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
