const awsParamStore = require('aws-param-store');
const unflatten = require('flat').unflatten;
const env = 'qa' ;// process.env.NODE_ENV.toLowerCase();
const region = process.env.AWS_REGION;

const Object_assign = (target, ...sources) => {
    sources.forEach(source => {
        Object.keys(source).forEach(key => {
            const s_val = source[key]
            const t_val = target[key]
            target[key] = t_val && s_val && typeof t_val === 'object' && typeof s_val === 'object'
                ? Object_assign(t_val, s_val)
                : s_val
        })
    })
    return target
}


const path = `/${env}/unified-api/`;
const resp = awsParamStore.getParametersByPathSync(path, { region: region });
const params = resp.map((param) => {
    const name = param.Name.replace(path, '');
    let val = param.Value;
    if (!Number.isNaN(Number(param.Value)))
        val = parseInt(param.Value);
    if (param.Value === 'true')
        val = true;
    if (param.Value === 'false')
        val = false;
    if (val === 'null')
        val = ''
    const obj = unflatten({ [name]: val }, { delimiter: '/', object: true });
    return obj;
});
const result = Object_assign({}, ...params)
console.log(JSON.stringify(result));

