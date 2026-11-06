import * as migration_20261105_094745_initial from './20261105_094745_initial';
import * as migration_20261106_031716_blob_object_key from './20261106_031716_blob_object_key';
import * as migration_20261106_032405_media_prefix from './20261106_032405_media_prefix';

export const migrations = [
  {
    up: migration_20261105_094745_initial.up,
    down: migration_20261105_094745_initial.down,
    name: '20261105_094745_initial',
  },
  {
    up: migration_20261106_031716_blob_object_key.up,
    down: migration_20261106_031716_blob_object_key.down,
    name: '20261106_031716_blob_object_key',
  },
  {
    up: migration_20261106_032405_media_prefix.up,
    down: migration_20261106_032405_media_prefix.down,
    name: '20261106_032405_media_prefix'
  },
];
