import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatTable, MatDialog, MatSnackBar } from '@angular/material';
import { of } from 'rxjs';
import { Empleado } from 'src/models/Empleado';
import { EmpleadoFormularioComponent, EmpleadoFormularioDialogData } from '../formulario/formulario.component';
import { EmpleadosService } from '../empleados.service';

@Component({
  selector: 'app-empleados-listado',
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.css']
})
export class EmpleadosListadoComponent implements OnInit {

  @ViewChild("tabla") public tabla: MatTable<Empleado>;
  public displayedColumns: string[] = [ "nombre", "rut", "acciones" ];

  @Input() public set Empleados(empleados: Empleado[]) {
    this.tabla.dataSource = of(empleados);
  }

  @Output() public recargar: EventEmitter<void> = new EventEmitter();

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private localSvc: EmpleadosService
  ) { }

  ngOnInit() {
  }

  public onClickBorrarEmpleado(emp: Empleado) {
    this.localSvc.borrarEmpleado(emp.idEmpleado).subscribe(
      (exito: boolean) => {
        if (exito) {
          this.snackBar.open("Empleado '"+emp.nombreCompletoPersona+"' eliminado.");
          this.recargar.emit();
        }
      }
    );
  }

  public onClickVerEmpleado(emp: Empleado) {
    const dialogData: EmpleadoFormularioDialogData = {
      empleado: emp
    };

    this.dialog.open(EmpleadoFormularioComponent, {
      width: "40rem",
      height: "40rem",
      data: dialogData
    }).afterClosed().subscribe(
      (nuevo: Empleado) => {
        if (nuevo) {
          this.recargar.emit();
        }
      }
    );
  }
}
