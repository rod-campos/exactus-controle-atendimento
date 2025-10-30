import {
  addToast,
  Button,
  Card,
  CardBody,
  Input,
  Tab,
  Tabs,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { InformacoesUsuario, UsuarioLogin } from "../service/service";
import jwtDecode from "jwt-decode";
import exactus_logo from "../assets/exactus_logo.svg";

function Login() {
  const [selected, setSelected] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const redirectUser = async (token) => {
    try {
      const res = await InformacoesUsuario(token);
      if (res.isAdmin && res.isActive) {
        window.location.href = "/dashboard/";
      } else if (!res.isAdmin && res.isActive) {
        window.location.href = "/atendimento/";
      }
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("usuario");
      return;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await UsuarioLogin({ email, password });
      console.log(response);
      localStorage.setItem("token", response.token);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("usuario", JSON.stringify(response.usuario));
      redirectUser(response.token);
      addToast({
        title: "Sucesso",
        description: `Bem-vindo, ${response.usuario.nomeUsuario}!`,
        color: "success",
      });
    } catch (error) {
      console.log(error);
      addToast({
        title: "Erro",
        description: "Falha no login. Verifique suas credenciais.",
        color: "danger",
      });
    }
  };

  useEffect(() => {
    redirectUser(localStorage.getItem("token"));
  }, [localStorage.getItem("token")]);

  return (
    <div className="flex flex-col gap-5 w-full h-screen justify-center items-center">
      <img src={exactus_logo} alt="Exactus Logo" width={300} />
      <Card className="max-w-full w-[340px] h-[300px]">
        <CardBody className="overflow-hidden">
          <Tabs
            fullWidth
            aria-label="Tabs form"
            selectedKey={selected}
            size="md"
            onSelectionChange={setSelected}
          >
            <Tab key="login" title="Login Exactus">
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <Input
                  isRequired
                  label="Email"
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  isRequired
                  label="Senha"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div className="flex gap-2 justify-end">
                  <Button type="submit" fullWidth color="warning">
                    Entrar
                  </Button>
                </div>
              </form>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}

export default Login;
