import { build as schemaBuild } from 'schemapack';
import { generateSchemaWithoutEnum, enumToUint, uintToEnum } from './enumeration.es';

export function withSchema(schema, options = {}) {
  const builtSchema = schemaBuild(generateSchemaWithoutEnum(schema, options.enumTypes));

  return {
    serialize: (obj) => builtSchema.encode(enumToUint(obj, schema, options.enumTypes)),
    deserialize: (data) => uintToEnum(builtSchema.decode(data), schema, options.enumTypes),
  };
}
