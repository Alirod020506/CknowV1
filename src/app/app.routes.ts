import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { CknowHomeComponent } from './cknow-home/cknow-home.component';
import { AltaCursoComponent } from './private/alta-curso/alta-curso.component';
import { CapacitacionesComponent } from './private/capacitaciones/capacitaciones.component';
import { CursosFinalizadosComponent } from './private/cursos-finalizados/cursos-finalizados.component';
import { CursosPendientesComponent } from './private/cursos-pendientes/cursos-pendientes.component';
import { CursosComponent } from './private/cursos/cursos.component';
import { ReporteCursosComponent } from './private/reporte-cursos/reporte-cursos.component';

export const routes: Routes = [
    { path: '', component: HomeComponent},
    {path: 'login', component: LoginComponent},
    { path: 'home', component: CknowHomeComponent,
         children: [
            { path: '', redirectTo: 'cursos', pathMatch: 'full' },
            { path: 'cursos', component: CursosComponent },
            { path: 'alta-curso', component: AltaCursoComponent },
            { path: 'capacitaciones', component: CapacitacionesComponent },
            { path: 'cursos-pendientes', component: CursosPendientesComponent },
            { path: 'cursos-finalizados', component: CursosFinalizadosComponent },
            { path: 'reporte-cursos', component: ReporteCursosComponent },
        ],
    },
    { path: '**', redirectTo: 'cursos' }, // Ruta por defecto


];
