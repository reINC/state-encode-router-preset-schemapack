import _ from 'lodash';

const enumPrefix = 'enum:';
const enumPrefixRegexp = /^enum:/i;

function convertEnums(data, schema, enumTypes, convert) {
  if (_.isArray(schema)) {
    // Recursion; when the schema is an array, it contains only one sub-schema
    return _.map(data, (val) => convertEnums(val, schema[0], enumTypes, convert));
  } else if (_.isObject(schema)) {
    // Recursion
    return _.mapValues(data, (val, key) => convertEnums(val, schema[key], enumTypes, convert));
  } else if (_.isString(schema) && enumPrefixRegexp.test(schema)) {
    // Enum type found
    return convert(data, schema.substr(enumPrefix.length));
  } else {
    // Other types
    return data;
  }
}

export function enumToUint(obj, schema, enumTypes = {}) {
  return convertEnums(obj, schema, enumTypes, (val, enumTypeName) => {
    const indexForEnum = enumTypes[enumTypeName].indexOf(val);

    if (indexForEnum >= 0) {
      return indexForEnum;
    } else {
      throw new Error(`Invalid enum value "${val}" for enum type "${enumTypeName}"`);
    }
  });
}

export function uintToEnum(obj, schema, enumTypes = {}) {
  return convertEnums(obj, schema, enumTypes, (val, enumTypeName) => {
    const strForEnum = enumTypes[enumTypeName][val];

    if (strForEnum) {
      return strForEnum;
    } else {
      throw new Error(`Invalid enum index "${val}" for enum type "${enumTypeName}"`);
    }
  });
}

export function generateSchemaWithoutEnum(schema, enumTypes = {}) {
  if (_.isArray(schema)) {
    // Recursion
    return _.map(schema, (val) => generateSchemaWithoutEnum(val, enumTypes));
  } else if (_.isObject(schema)) {
    // Recursion
    return _.mapValues(schema, (val) => generateSchemaWithoutEnum(val, enumTypes));
  } else if (_.isString(schema)) {
    if (enumPrefixRegexp.test(schema)) {
      // Enum type found
      const enumTypeName = schema.substr(enumPrefix.length);

      if (enumTypes[enumTypeName]) {
        const enumCount = enumTypes[enumTypeName].length;

        if (enumCount <= 2) {
          return 'boolean';
        } else if (enumCount <= 0x100) {
          return 'uint8';
        } else if (enumCount <= 0x10000) {
          return 'uint16';
        } else if (enumCount <= 0x100000000) {
          return 'uint32';
        } else {
          return 'varuint';
        }
      } else {
        throw new Error(`Undefined enum type "${enumTypeName}"`);
      }
    } else {
      // Other types
      return schema;
    }
  } else {
    throw new Error(`Unknown type "${schema}" in schema`);
  }
}
