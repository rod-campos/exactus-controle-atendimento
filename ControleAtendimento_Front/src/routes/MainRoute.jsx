import { Route, Routes } from "react-router";
import Cliente from "../pages/Cliente";
import Usuarios from "../pages/Usuarios";
import Cas from "../pages/Cas";
import Modulos from "../pages/Modulos";
import Assuntos from "../pages/Assuntos";
import TipoAtendimento from "../pages/TipoAtendimento";
import Sugestoes from "../pages/Sugestoes";

function MainRoute() {
  return (
    <Routes>
      <Route path="/" element={<Usuarios />} />
      <Route path="/clientes" element={<Cliente />} />
      <Route path="/usuarios" element={<Usuarios />} />
      <Route path="/cas" element={<Cas />} />
      <Route path="/modulos" element={<Modulos />} />
      <Route path="/assuntos" element={<Assuntos />} />
      <Route path="/tipo-atendimento" element={<TipoAtendimento />} />
      <Route path="/sugestoes" element={<Sugestoes />} />
    </Routes>
  );
}

export default MainRoute;
