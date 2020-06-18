import { EntityLocalMemoryDataService } from './local-memory-data.abstract-service';
import { Injectable } from '@angular/core';
import { Usuario } from 'src/models/entities/Usuario';

export const MOCK_USERS: Partial<Usuario>[] = [
  {
    id: 1,
    nombre: 'Usuario de prueba 1',
    fechaCreacionUsuario: '2020-06-16',
    nombrePersona: 'Benjamin Guillermo',
    rutPersona: '1111111-1'
  }
];

@Injectable()
export class UsuariosLocalMemoryDataService
  extends EntityLocalMemoryDataService<Usuario> {

  protected items: Usuario[] = MOCK_USERS.map(n => Object.assign(new Usuario(), n));

  constructor() {
    super();
  }
}
