import { Component, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { from, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MSJ_ERROR_COMM_SRV } from 'src/app/shared/constantes';
import { ProductosHttpService } from 'src/http-services/productos-http.service';
import { Producto } from 'src/models/Producto';
import { MantenedorGestionComponent } from '../mantenedor-gestion.abstract-component';
import {
  ProductoFormDialogGestionComponent,
  ProductoFormDialogGestionData
} from './form-dialog/producto-form-dialog.component';
import { ListadoProductosGestionComponent } from './listado/listado-productos.component';

@Component({
  selector: 'app-mantenedor-productos-gestion',
  templateUrl: './mantenedor-productos.component.html',
  styleUrls: [
    '../../../assets/styles/navegadores.css'
  ]
})
export class MantenedorProductosGestionComponent
  extends MantenedorGestionComponent<Producto> {

  @ViewChild('listado', { static: true }) public listado: ListadoProductosGestionComponent;

  constructor(
    protected httpSvc: ProductosHttpService,
    protected dialog: MatDialog,
    protected snackBar: MatSnackBar
  ) {
    super();
  }

  public cargarItems(): Observable<Producto[]> {
    return this.httpSvc.listarProductos();
  }

  public abrirDialogoEdicion(item: Producto): Observable<Producto> {

    const dialogConfig: MatDialogConfig = {
      width: '40rem'
    };

    if (item) {
      const dialogData: ProductoFormDialogGestionData = { producto: item };
      dialogConfig.data = dialogData;
    }

    const dialog = this.dialog.open(ProductoFormDialogGestionComponent, dialogConfig);

    return from(dialog.afterClosed());
  }

  public onClickBorrar(prod: Producto) {
    this.ocupadoSource.next(true);
    this.httpSvc.borrarProducto(prod.idProducto).pipe(
      finalize(() => { this.ocupadoSource.next(false); })
    ).subscribe(
      (exito: boolean) => {
        if (exito) {
          this.snackBar.open('Producto \'' + prod.nombreProducto + '\' eliminado.');
          this.onCargar();
        } else {
          this.snackBar.open('Hubo un problema al borrar el producto.');
        }
      },
      () => {
        this.snackBar.open(MSJ_ERROR_COMM_SRV, 'OK', { duration: -1 });
      }
    );
  }

}
