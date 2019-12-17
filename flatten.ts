import config from '../unified-api/config/qa';
import veritixConfig from '../unified-api/veritix/conf/qa';
import axsConfig from '../unified-api/axs/config/qa';
import flashConfig from '../unified-api/flash/cfg/qa';
import mobileConfig from '../unified-api/mobile/conf/qa';
//import pageTimersConfig from '../unified-api/veritix/conf/pageTimers/qa';
import AWS, { SSM } from 'aws-sdk';

const ssm = new AWS.SSM({ region: "us-west-2" });

/*
resource "aws_ssm_parameter" "webboxoffice_2" {
    name   = "/${var.octopus_environment}/webboxoffice/axsApiToken"
      type   = "SecureString"
      value  = "${var.axsApiToken}"
      description = "The API Token"
      overwrite = true
    }
*/  
const createtf = (params: Map<string, string>, subsystem: string | undefined ) => {
    const env = params.get("env");
    let i = 0;
    for (let [key, value] of params) {
        let name = "/${var.octopus_environment}/unified-api/";
        name += subsystem == undefined ? `${key}` : `${subsystem}/${key}`
        const type = key === "password" ? "SecureString" : "String"
        if (value === '') {
            value = "null";
        }
        if (key != 'env') {
            const line1 = `resource "aws_ssm_parameter" "unified_api_${subsystem}_${i++}" {` ;
            const line2 = `     name   = "${name.toLowerCase()}"`;
            const line3 = `     type   = "${type}"`
            const line4 = `     value  = "${value}"`
            const line5 = `     overwrite = true`
            const line6 = `}`
            console.log(line1);
            console.log(line2);
            console.log(line3);
            console.log(line4);
            console.log(line5);
            console.log(line6);
        }
    }
}

const flatten = (data: any) => {
    let result = new Map<string, string>();
    function recurse(cur: any, prop: string) {
        if (Object(cur) !== cur) {
            result.set(prop, cur.toString());
        } else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++)
                recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result.set(prop, '');
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop + "/" + p : p);
            }
            if (isEmpty && prop)
                result.set(prop, '');
        }
    }
    recurse(data, "");
    return result;
}

function putParameters(params: Map<string, string>, subsystem: string | undefined) {
    const env = params.get("env");
    for (let [key, value] of params) {
        let name = `/${env}/unified-api/`;
        name += subsystem == undefined ? `${key}` : `${subsystem}/${key}`
        const type = key === "password" ? "SecureString" : "String"
        if (value === '') {
            value = "null";
        }
        const params: SSM.Types.PutParameterRequest = {
            Name: name,
            Value: value,
            Type: type,
            Overwrite: true
        }
        if (key != 'env') {
            ssm.putParameter(params, (err, data) => {
                if (err) {
                    console.log(err); // an error occurred
                    console.log(params);
                }
            });
        }
    }
}

const params1 = flatten(config);
const params2 = flatten(veritixConfig);
const params3 = flatten(axsConfig);
const params4 = flatten(flashConfig);
const params5 = flatten(mobileConfig);
// console.log('config', params1, params1.size);
// console.log('veritix', params2, params2.size);
// console.log('axs', params3, params3.size);
// console.log('flash', params4, params4.size);
// console.log('mobile', params5, params5.size);
// console.log('total', params1.size + params2.size + params3.size + params4.size + params5.size)
//putParameters(params1, undefined);
//putParameters(params2, "veritix");
//putParameters(params3, "axs");
//putParameters(params4, "flash");
//putParameters(params5, "mobile");
createtf(params1, undefined);
createtf(params2, "veritix");
createtf(params3, "axs");
createtf(params4, "flash");
createtf(params5, "mobile");
