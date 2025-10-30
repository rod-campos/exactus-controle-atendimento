import { Button, Tooltip } from "@heroui/react";
import { use, useEffect, useState } from "react";
import logo from "../assets/exactus_logo.svg";
import icone_logo from "../assets/icon_exactus.svg";
import Icon from "@mdi/react";
import {
  mdiAccountMultipleOutline,
  mdiHandshakeOutline,
  mdiLogout,
  mdiMenuLeftOutline,
  mdiMenuRightOutline,
  mdiMulticast,
  mdiPhoneMessageOutline,
  mdiLightbulbOnOutline,
  mdiBookOpenVariant,
  mdiClipboardTextOutline,
} from "@mdi/js";
import { useLocation, useNavigate } from "react-router";
import { UsuarioLogout } from "../service/service";

function Navbar() {
  const url = useLocation();
  const navigate = useNavigate();

  const [slim, setSlim] = useState(() => {
    const savedSlim = localStorage.getItem("navbarSlim");
    return savedSlim ? JSON.parse(savedSlim) : false;
  });

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

  const buttonData = [
    {
      icon: mdiAccountMultipleOutline,
      label: "Usuários",
      path: "/dashboard/usuarios",
    },
    {
      icon: mdiHandshakeOutline,
      label: "Clientes",
      path: "/dashboard/clientes",
    },
    { icon: mdiMulticast, label: "Módulos", path: "/dashboard/modulos" },
    {
      icon: mdiBookOpenVariant,
      label: "Assuntos",
      path: "/dashboard/assuntos",
    },
    {
      icon: mdiClipboardTextOutline,
      label: "Tipo Atendimento",
      path: "/dashboard/tipo-atendimento",
    },
    { icon: mdiPhoneMessageOutline, label: "CAs", path: "/dashboard/cas" },
    {
      icon: mdiLightbulbOnOutline,
      label: "Sugestões",
      path: "/dashboard/sugestoes",
    },
  ];

  useEffect(() => {
    localStorage.setItem("navbarSlim", JSON.stringify(slim));
  }, [slim]);
  return (
    <div
      className={`${
        slim ? "w-[8%] min-w-[110px]" : "w-[25%] min-w-[280px]"
      } h-full flex flex-col justify-start items-center bg-white text-custom-gray shadow-xl transition-all duration-300 ease-in-out`}
    >
      <div className="p-5">
        {slim ? (
          <img src={icone_logo} alt="Logo" width={50} />
        ) : (
          <img src={logo} alt="Logo" width={200} />
        )}
      </div>

      <div className={`${slim ? "p-2" : "p-5"} w-full h-full flex flex-col`}>
        {buttonData.map((button, index) => {
          const isSelected = url.pathname === button.path;
          return slim ? (
            <Tooltip showArrow content={button.label} key={index}>
              <Button
                fullWidth
                size="lg"
                variant={isSelected ? "faded" : "light"}
                color={isSelected ? "warning" : "default"}
                className="h-20 flex justify-center items-center gap-2"
                key={index}
                onPress={() => navigate(button.path)}
              >
                <Icon path={button.icon} size={1.2} />
              </Button>
            </Tooltip>
          ) : (
            <Button
              fullWidth
              size="lg"
              variant={isSelected ? "faded" : "light"}
              color={isSelected ? "warning" : "default"}
              className="h-20 flex justify-center items-center gap-2"
              key={index}
              onPress={() => navigate(button.path)}
            >
              <div className="w-[80%] flex justify-start items-center gap-4">
                <Icon path={button.icon} size={1.2} />
                <span className="text-xl">{button.label}</span>
              </div>
            </Button>
          );
        })}
      </div>
      <div
        className={`${
          slim ? "p-5" : "p-5"
        } w-full h-[20%] flex flex-col justify-between items-center gap-2`}
      >
        {slim ? (
          <Tooltip showArrow content="Sair">
            <Button
              fullWidth
              size="lg"
              variant="light"
              className=" h-20 flex justify-center items-center gap-2 text-custom-gray"
              onPress={handleLogout}
            >
              <Icon path={mdiLogout} size={1.2} />
            </Button>
          </Tooltip>
        ) : (
          <Button
            fullWidth
            size="lg"
            variant="light"
            className=" h-20 flex justify-center items-center gap-2 text-custom-gray"
            onPress={handleLogout}
          >
            <div className="w-[80%] flex justify-start items-center gap-4">
              <Icon path={mdiLogout} size={1.2} />
              <span className="text-xl">Sair</span>
            </div>
          </Button>
        )}
        <Button
          isIconOnly
          variant="faded"
          color="warning"
          onPress={() => setSlim(!slim)}
        >
          {slim ? (
            <Icon path={mdiMenuRightOutline} size={1.2} />
          ) : (
            <Icon path={mdiMenuLeftOutline} size={1.2} />
          )}
        </Button>
      </div>
    </div>
  );
}

export default Navbar;
