import config from '../unified-api/config/qa';
import veritixConfig from '../unified-api/veritix/conf/qa';
import axsConfig from '../unified-api/axs/config/qa';
import flashConfig from '../unified-api/flash/cfg/qa';
import mobileConfig from '../unified-api/mobile/conf/qa';
//import pageTimersConfig from '../unified-api/veritix/conf/pageTimers/qa';
import AWS, { SSM } from 'aws-sdk';

const ssm = new AWS.SSM({ region: "us-west-2" });

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
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
console.log('config', params1, params1.size);
console.log('veritix', params2, params2.size);
console.log('axs', params3, params3.size);
console.log('flash', params4, params4.size);
console.log('mobile', params5, params5.size);
console.log('total', params1.size + params2.size + params3.size + params4.size + params5.size)
//putParameters(params1, undefined);
//putParameters(params2, "veritix");
//putParameters(params3, "axs");
putParameters(params4, "flash");
putParameters(params5, "mobile");
