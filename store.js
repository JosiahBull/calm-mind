const electron = require('electron');
const path = require('path');
const fs = require('fs').promises;

function parse_data_file(file_path, defaults) {
    return fs.readFile(file_path).then(file => JSON.parse(file)).catch(_ => defaults);
}

class Store {
    constructor(opts) {
        const user_data_path = (electron.app || electron.remote.app).getPath('userData');
        this.path = path.join(user_data_path, opts.config_name = '.json');
        this.data = parse_data_file(this.path, opts.defaults);
    }
    get(key) {
        return this.data[key];
    }
    set(key, val) {
        this.data[key] = val;
        fs.writeFile(this.path, JSON.stringify(this.data));
    }
    delete(key) {
        delete this.data[key];
        fs.writeFile(this.path, JSON.stringify(this.data));
    }
}


module.exports = Store;