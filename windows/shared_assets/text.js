class Text {
    constructor(elem, opts) {
        let { shell, ipcRenderer } = require('electron');
        this.ipcRenderer = ipcRenderer;
        this.shell = shell;

        //Check if any other text inputs have been created, if not then perform inital setup.
        if (!window.text_editors) {
            window.text_inputs = {
                register: [],
                counter: 0,
                get: function get() { //Get all text inputs and their data.
                    
                }
            };
            let styles = document.createElement('style');
            styles.innerHTML = `
            .surrounding_div {
                display:flex;
                flex-direction: row;
                border-bottom: 1px solid rgb(200, 200, 200);
                justify-content: space-between;
                margin: 10px 0px;
                border-radius: 8px 8px 0px 0px;
                max-width: 100vw;
                overflow: hidden;
            }
            .surrounding_div.marked {
                background-color: rgb(255, 220, 217);
                border-bottom: 2px solid rgb(140, 11, 0);
            }

            .main_label ,
            .input_text_container {
                font-family: Georgia, "Times New Roman", Times, serif;
                margin-top: 10px;
                margin-bottom: 10px;
            }

            .main_label {
                padding-top: 6px;
                padding-bottom: 6px;
                padding-left: 20px;
                margin-right: 10px;
                max-height: 10vh;
                overflow-y: auto;
                overflow-x: hidden;
                min-width: 200px;
            }
            
            .path_container {
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: space-between;
                max-width: 80%;
            }

            .path_title_container {
                min-width: 100px;
                max-width: 350px;
                width: 35vw;
                box-sizing: border-box;
                overflow: hidden;
                cursor: pointer;
            }
            .path_limit {
                direction: rtl;
                text-align: left;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                width: 100%;
                left: 0%;
                color:blue;
                text-decoration:underline;

                transition: right 3s 0.5s ease-in-out, width 3s 0.5s ease-in-out;
                transition-delay: 0.2s;
            }
            .path_title_container:hover .path_limit {
                right: -200%;
                width: 300%;
            }
            
            .folder_icon_button {
                width: 30px;
                margin-left: 30px;
                cursor: pointer;
            }`;
            document.querySelector('head').appendChild(styles);
        }

        //Deconstruct opts
        const { label= '', placeholder = '', allow_empty = true, type = 'text', create_if_not_exist = true, callback = null } = opts;

        this.error = true;
        if (!label) console.error('Failed to create text input, no label supplied');
        if (elem === null) console.error('Failed to create text input, elem supplied is null (may not exist)');

        //Bind properties
        this.elem = elem; //STore the original elem if we need to destroy this toggle in the future and restore the original elem.
        this.placeholder = placeholder;
        this.data = placeholder;
        this.allow_empty = allow_empty;
        this.type = type;
        this.create_if_not_exist = create_if_not_exist;
        this.callback = callback;
        this.label = label;
        this.error = false; //Set error to false, as everything succesfully initalized.

        //Create counter if not exist then set id.
        this.id = "TextInput_ID_" + Date.now() + "_" + window.text_inputs.counter++;
        elem.is = this.id;

        //Create element
        try {
            const template = `
                <div class="surrounding_div">
                    <span class="main_label">${this.label}</span>
                    <span class="path_container">
                        <span class="path_title_container"><p id="select_path_text_ID_${this.id}" class="path_limit">${placeholder}</p></span>
                        <img id="select_path_ID_${this.id}" class="folder_icon_button" src="../shared_assets/folder.svg">
                    </span>
                </div>
            `;
            window.text_inputs.register.push(this);

            elem.innerHTML = template;
            
            //Add listeners
            document.querySelector(`#select_path_text_ID_${this.id}`).addEventListener('click', () => shell.openPath(this.data));
            document.querySelector(`#select_path_ID_${this.id}`).addEventListener('click', () => this.ipcRenderer.send('select_dir'));
            this.ipcRenderer.on('dir_selected', (event, arg) => this.update_path(arg));
            
        } catch (err) {
            //TODO: Remove failed init attempt just in case.
            console.error(`Faile to create text input element. ${err.stack}`);
            this.error = true;
        }
    }
    update_path(data) {
        if (data.canceled) return; //No change to path
        this.data = data.filePaths[0];
        if (this.callback) this.callback(this.data);

        document.querySelector(`#select_path_text_ID_${this.id}`).innerText = this.data;
    }
}

module.exports = Text;