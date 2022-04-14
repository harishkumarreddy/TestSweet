const config = {
    configfilename: 'testsweet.config.json',
}

config.load = (props)=>{
    if(props !== undefined){
        Object.keys(props).forEach((key)=>{
            config[key] = props[key];
        });
    }
}
config.get = (key)=>{
    return config[key];
}
config.set = (key, value)=>{
    config[key] = value;
}

module.exports = config;