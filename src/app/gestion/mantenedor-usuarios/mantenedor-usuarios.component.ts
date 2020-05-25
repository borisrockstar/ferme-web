import { Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { from, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MSJ_ERROR_COMM_SRV } from 'src/app/shared/constantes';
import { UsuariosHttpService } from 'src/http-services/usuarios-http.service';
import { Usuario } from 'src/models/Usuario';
import { MantenedorGestionComponent } from '../mantenedor-gestion.abstract-component';
import {
  UsuarioFormDialogGestionComponent,
  UsuarioFormDialogGestionData
} from './form-dialog/usuario-form-dialog.component';
import { ListadoUsuariosGestionComponent } from './listado/listado-usuarios.component';

@Component({
  selector: 'app-mantenedor-usuarios-gestion',
  templateUrl: './mantenedor-usuarios.component.html',
  styleUrls: [
    '../../../assets/styles/navegadores.css'
  ]
})
export class MantenedorUsuariosGestionComponent
  extends MantenedorGestionComponent<Usuario> {

  @ViewChild('listado', { static: true }) public listado: ListadoUsuariosGestionComponent;

  constructor(
    protected httpSvc: UsuariosHttpService,
    protected dialog: MatDialog,
    protected snackBar: MatSnackBar
  ) {
    super();
  }

  public cargarItems(): Observable<Usuario[]> {
    return this.httpSvc.listarUsuarios();
  }

  public abrirDialogoEdicion(item: Usuario): Observable<Usuario> {

    const dialogConfig: MatDialogConfig = {
      width: '40rem'
    };

    if (item) {
      const dialogData: UsuarioFormDialogGestionData = { usuario: item };
      dialogConfig.data = dialogData;
    }

    const dialog = this.dialog.open(UsuarioFormDialogGestionComponent, dialogConfig);

    return from(dialog.afterClosed());
  }

  public onClickBorrar(usr: Usuario) {
    this.ocupadoSource.next(true);
    this.httpSvc.borrarUsuario(usr.idUsuario).pipe(
      finalize(() => { this.ocupadoSource.next(false); })
    ).subscribe(
      (exito: boolean) => {
        if (exito) {
          this.snackBar.open('Usuario \'' + usr.nombreCompletoPersona + '\' eliminado.');
          this.onCargar();
        } else {
          this.snackBar.open('Hubo un problema al borrar el empleado.');
        }
      },
      () => {
        this.snackBar.open(MSJ_ERROR_COMM_SRV, 'OK', { duration: -1 });
       }
    );
  }

}
