const fs = require("fs");
const VortoModelConverter = require("./models/VortoModel/VortoModelConverter");
const utils = require("./utils");
const vortoApi = require("./models/VortoModel/api");
const util = require("util");
/**
 * Convert a Vorto Model to a Thing Model
 *
 */
async function convert() {
  const { fileName: vortoModelId } = utils.getConsoleArguments();
  const vortoModel = utils.getDataFromFile(vortoModelId);
  // const { data: vortoModel } = await vortoApi.get(
  //   `${VortoModelId}/content/jsonschema`
  // );
  // console.log(util.inspect(vortoModel, true, 5));
  const vortoModelConverter = new VortoModelConverter(vortoModel, vortoModelId);
  const thingModel = vortoModelConverter.convert();
  //   const sdfObject = utils.getDataFromFile('./' + sdfObjectFileName);
  //   const sdfObjectConverter = new SDFObjectConverter(sdfObject);
  //   const thingModel = sdfObjectConverter.convert();
  //   const thingModelJSON = JSON.stringify(thingModel, null, '\t');
  fs.writeFileSync(
    "./generated-thing-model.json",
    JSON.stringify(thingModel, null, "\t")
  );
}

convert();
