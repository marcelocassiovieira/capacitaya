import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LearningPathProvider } from "@/context/LearningPathContext";
import { UserProvider } from "@/context/UserContext";
import NotFound from "@/pages/not-found";
import { DemoApi } from "@/pages/DemoApi";
import { Dashboard } from "@/pages/Dashboard";
import { PlanCapacitacion } from "@/pages/PlanCapacitacion";
import { ModuloIA } from "@/pages/ModuloIA";
import { Evaluacion } from "@/pages/Evaluacion";
import { ProgresoyLogros } from "@/pages/ProgresoyLogros";
import { CanalTutor } from "@/pages/CanalTutor";
import { MisHabilidades } from "@/pages/MisHabilidades";
import { PanelTutor } from "@/pages/PanelTutor";
import { TutorCompanias } from "@/pages/TutorCompanias";
import { TutorGapAnalysis } from "@/pages/TutorGapAnalysis";
import { DetalleCandidato } from "@/pages/DetalleCandidato";
import { NuevoPuesto } from "@/pages/NuevoPuesto";
import { ListadoPuestos } from "@/pages/ListadoPuestos";
import { Login } from "@/pages/Login";
import { ListadoPuestosEvaluacion } from "@/pages/ListadoPuestosEvaluacion";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/student" component={Dashboard} />
      <Route path="/student/plan" component={PlanCapacitacion} />
      <Route path="/student/modulo" component={ModuloIA} />
      <Route path="/student/evaluacion" component={Evaluacion} />
      <Route path="/student/progreso" component={ProgresoyLogros} />
      <Route path="/student/canal-tutor" component={CanalTutor} />
      <Route path="/student/skills" component={MisHabilidades} />
      <Route path="/student/panel-tutor" component={PanelTutor} />
      <Route path="/student/detalle-candidato" component={DetalleCandidato} />
      <Route path="/companies" component={ListadoPuestos} />
      <Route path="/companies/new-job" component={NuevoPuesto} />
      <Route path="/companies/jobs" component={ListadoPuestos} />
      <Route path="/tutor" component={PanelTutor} />
      <Route path="/tutor/companies" component={TutorCompanias} />
      <Route path="/tutor/gap-analysis" component={TutorGapAnalysis} />
      <Route path="/tutor/jobs" component={ListadoPuestosEvaluacion} />
      <Route path="/demo-api" component={DemoApi} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <LearningPathProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </LearningPathProvider>
          <Toaster />
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
