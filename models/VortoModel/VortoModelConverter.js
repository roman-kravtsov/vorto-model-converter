const Converter = require("../Converter/Converter");

/**
 * A Vorto Model object
 * @typedef {Object} VortoModelObject
 */

/**
 * Converter from Vorto model to thing description using thing description templates
 *
 * @class VortoModelConverter
 * @extends {Converter}
 */
class VortoModelConverter extends Converter {
  /**
   * Creates an instance of ThingModel.
   * @param {VortoModelObject} model Vorto Model
   * @param {String} name Vorto Model name
   * @memberof VortoModelConverter
   */
  constructor(data, name) {
    super({ properties: {}, actions: {}, events: {} });
    this.rootData = data;
    this.modelName = name;
    this.mainModel = data.models[data.root.prettyFormat];
    this.typeMap = {
      boolean: "boolean",
      double: "number",
      dateеime: "date",
      duration: "string",
      float: "number",
      int: "integer",
      long: "integer",
      base64иinary: "string",
      string: "string",
      short: "integer",
      byte: "integer",
    };
  }

  __mapType(type) {
    return this.typeMap[type] || "string";
  }

  __mapEnumModelToProperty(literals) {
    const enumData = literals.reduce(
      (enumOptions, currentOption) => {
        enumOptions.enum.push(currentOption.name);
        return enumOptions;
      },
      { enum: [] }
    );
    return { propertyData: enumData, type: "string" };
  }

  __mapReferencesToProperty(references) {
    if (references.length === 1) {
      const model = this.__getReference(references[0]);

      return { ...this.__constructThingModelProperty(model) };
    }
    let properties = {};
    for (const reference of references) {
      const model = this.__getReference(reference);
      properties = {
        ...properties,
        ...this.__constructThingModelProperty(model),
      };
    }
    return { propertyData: properties, type: "object" };
  }

  __mapReferencesToEvents(references) {
    if (references.length === 1) {
      const model = this.__getReference(references[0]);

      return { ...this.__mapEvents(model.events) };
    }
    let events = {};
    for (const reference of references) {
      const model = this.__getReference(reference);
      events = {
        ...events,
        ...this.__mapEvents(model.events),
      };
    }
    return events;
  }
  __mapStatusProperty(statusProperty) {
    const type = typeof statusProperty.type;
    switch (type) {
      case "object":
        return {
          ...this.__constructThingModelProperty(
            this.__getReference(statusProperty.type)
          ),
          type: "object",
        };
      case "string":
        return {
          name: statusProperty.name,
          type: this.__mapType(statusProperty.type.toLowerCase()),
        };
      // case "BOOLEAN":
    }
  }

  __mapEvent(event) {
    const { propertyData: data } = this.__mapStatusProperties(event.properties);
    return {
      name: event.name,
      data: { type: "object", properties: data.properties },
    };
  }

  __mapEvents(events) {
    let mappedEvents = {};
    for (const event of events) {
      mappedEvents = {
        ...mappedEvents,
        [event.name]: this.__mapEvent(event),
      };
    }
    return mappedEvents;
  }

  __mapStatusProperties(statusProperties) {
    if (statusProperties.length === 1) {
      const statusProperty = statusProperties[0];

      return {
        propertyData: {
          properties: {
            [statusProperty.name]: this.__mapStatusProperty(statusProperty),
          },
        },
        type: "object",
      };
    }
    let properties = {};
    for (const statusProperty of statusProperties) {
      properties = {
        ...properties,
        [statusProperty.name]: this.__mapStatusProperty(statusProperty),
      };
    }
    return { propertyData: { properties }, type: "object" };
  }
  __getReference(reference) {
    return this.rootData.models[reference.prettyFormat];
  }

  __getPropertyHandler(propertyType) {
    switch (propertyType) {
      case "enum":
        return "__mapEnumModelToProperty";
      case "reference":
        return "__mapReferencesToProperty";
      case "statusProperty":
        return "__mapStatusProperties";
    }
  }

  __constructThingModelProperty(model) {
    let accessKey = "";
    let propertyType = "string";
    switch (model.modelType) {
      case "EnumModel":
        accessKey = "literals";
        propertyType = "enum";
        break;
      case "FunctionblockModel":
        if (model.references.length > 0) {
          accessKey = "references";
          propertyType = "reference";
          break;
        }
        accessKey = "statusProperties";
        propertyType = "statusProperty";
        break;
    }

    let { propertyData, type } = this[this.__getPropertyHandler(propertyType)](
      model[accessKey]
    );
    return {
      [model.displayName]: { name: model.displayName, type, ...propertyData },
    };
  }

  __constructThingModelProperties() {
    let { propertyData: properties } = this.__mapReferencesToProperty(
      this.mainModel.references
    );
    return properties;
  }

  __constructThingModelEvents() {
    return this.__mapReferencesToEvents(this.mainModel.references);
  }

  /**
   * Map properties of a Thing Model to the properties of a Thing Description
   *
   */
  mapProperties() {
    this.targetModel.properties = this.__constructThingModelProperties();
  }
  /**
   * Map actions of a Thing Model to the actions of a Thing Description
   *
   */
  mapActions() {}

  /**
   * Map events of a Thing Model to the events of a Thing Description
   *
   */
  mapEvents() {
    this.targetModel.events = this.__constructThingModelEvents();
  }

  /**
   * Convert Vorto Model to a Thing Model
   *
   * @returns {Object} Thing Model
   * @memberof VortoModelConverter
   */
  convert() {
    // this.targetModel.created = now;
    // this.targetModel.modified = now;
    const now = new Date(Date.now());
    this.targetModel.created = now;
    this.targetModel.modified = now;
    this.targetModel["@context"] = ["https://www.w3.org/2019/wot/td/v1"];
    this.targetModel["@type"] = "Thing";
    this.targetModel.description = this.mainModel.description;
    this.targetModel.title = this.mainModel.displayName;
    this.mapProperties();
    // this.mapActions();
    this.mapEvents();
    return this.targetModel;
  }
}
module.exports = VortoModelConverter;
