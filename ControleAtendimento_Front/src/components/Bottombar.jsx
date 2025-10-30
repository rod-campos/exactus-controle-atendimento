import { Button, Card, Tooltip } from "@heroui/react";
import {
  mdiAccount,
  mdiChatOutline,
  mdiCog,
  mdiLogout,
  mdiMail,
  mdiPen,
  mdiPlus,
  mdiSnowflake,
} from "@mdi/js";
import Icon from "@mdi/react";
import { useNavigate } from "react-router";
import { UsuarioLogout } from "../service/service";

function Bottombar({ onPressCreate, onPressSuggestion }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await UsuarioLogout();
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("usuario");
      navigate("/");
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };

  return (
    <div className="w-[50%] min-h-20 flex justify-between items-center p-3 bg-white text-custom-gray rounded-full border-1 border-gray-200">
      <div className="flex items-center justify-center gap-5">
        <div className="flex items-center gap-2">
          <Icon path={mdiAccount} size={1} color={"#404040"} />
          <span>{usuario.nomeUsuario}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon path={mdiMail} size={1} color={"#404040"} />
          <span>{usuario.email}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Tooltip content="Novo Atendimento" placement="top">
          <Button
            isIconOnly
            radius="full"
            variant="faded"
            onPress={onPressCreate}
          >
            <Icon path={mdiPlus} size={1} color={"#404040"} />
          </Button>
        </Tooltip>
        <Tooltip content="Criar sugestão" placement="top">
          <Button
            isIconOnly
            radius="full"
            variant="faded"
            onPress={onPressSuggestion}
          >
            <Icon path={mdiChatOutline} size={1} color={"#404040"} />
          </Button>
        </Tooltip>
      </div>

      <Tooltip content="Sair" placement="top">
        <Button
          isIconOnly
          radius="full"
          variant="faded"
          color="danger"
          onPress={handleLogout}
        >
          <Icon path={mdiLogout} size={1} />
        </Button>
      </Tooltip>
    </div>
  );
}

export { Bottombar };
