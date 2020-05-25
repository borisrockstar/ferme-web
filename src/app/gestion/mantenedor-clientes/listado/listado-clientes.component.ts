import { Component, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { ListadoGestionComponent } from 'src/app/gestion/listado-gestion.abstract-component';
import { Cliente } from 'src/models/Cliente';

@Component({
  selector: 'app-listado-clientes-gestion',
  templateUrl: './listado-clientes.component.html',
  styleUrls: [
    '../../../../assets/styles/formularios.css',
    './listado-clientes.component.css'
  ]
})
export class ListadoClientesGestionComponent
  extends ListadoGestionComponent<Cliente>  {

  @ViewChild('tabla', { static: true }) public tabla: MatTable<Cliente>;

  constructor(

  ) {
    super();
    this.columnasTabla = [ 'nombre', 'rut' ];
  }
}
