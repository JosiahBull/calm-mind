const electron = require('electron');
const path = require('path');
const fs = require('fs');

function parse_data_file(file_path, defaults) {
    try {
        return JSON.parse(fs.readFileSync(file_path));
    } catch (err) {
        return defaults;
    }
}

class Store {
    constructor(opts) {
        const user_data_path = (electron.app || electron.remote.app).getPath('userData');
        this.path = path.join(user_data_path, opts.config_name + '.json');
        this.data = parse_data_file(this.path, opts.defaults);
        this.defaults = opts.defaults;
    }
    get(key) {
        let item = this.data;
        key.split('.').forEach(key => item = item[key]);
        return item;
    }
    async set(key, val) {
        let item = this.data;
        let key_list = key.split('.');
        for (let i = 0; i < key_list.length -1; i++) {
            if (item[key_list[i]]) item = item[key_list[i]];
        }
        item[key_list.pop()] = val;
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }
    delete(key) {
        let item = this.data;
        let key_list = key.split('.');
        for (let i = 0; i < key_list.length -1; i++) {
            if (item[key_list[i]]) item = item[key_list[i]];
        }
        delete item[key_list.pop()];
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }
    reset() { //Reset to defaults
        
    }
}


module.exports = Store;