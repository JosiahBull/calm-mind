class Toggle {
    constructor(elem, opts) {
        this.ipcRenderer = require('electron').ipcRenderer;

        //Create the location for storing information about counters if not exist. Also add stylesheet information, as it doesn't exist.
        if (!window.toggles) {
            window.toggles = {
                register: [],
                counter: 0,
                validate: function validate() {
                    let valid = true;
                    this.register.map(toggle => {
                        let result = toggle.check();
                        toggle.mark(!result);
                        if (!result) valid = false;
                    });
                    return valid;
                },
                get: function get() {
                    if (!this.validate) console.error('Not able to get full data as errors are present');
                    return this.register.map(toggle => [toggle.placeholder, toggle.getData()]).filter(item => item[1] !== null);
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
                }
                .surrounding_div.marked {
                    background-color: rgb(255, 220, 217);
                    border-bottom: 2px solid rgb(140, 11, 0);
                }

                span.main_label {
                    padding-left: 20px;
                    margin-right: 10px;
                    max-height: 10vh;
                    overflow-y: auto;
                    overflow-x: hidden;
                    min-width: 200px;
                }

                .main_label ,
                .toggle_container{
                    font-family: Georgia, "Times New Roman", Times, serif;
                    margin-top: 10px;
                    margin-bottom: 10px;
                }

                /* Button Height */
                .main_label,
                .yes_button, 
                .no_button {
                    padding-top: 6px;
                    padding-bottom: 6px;
                }

                .refresh_button {
                    cursor: pointer;
                    margin-top: 6px;
                    margin-left: 15px;
                    height: 25px;
                    width: 25px;
                }
                .refresh_button > img {
                    height: 20px;
                    opacity: 0.5;
                }
                .refresh_button:hover > img {
                    opacity: 0.8;
                }

                /* Button Border */
                .yes_button,
                .no_button {
                    padding-left: 20px;
                    padding-right: 20px;
                    border: 1px solid black;
                    cursor: pointer;
                    user-select: none;
                    margin: 0px;
                }

                .toggle_container {
                    display: flex;
                    overflow: hidden;
                    color: black;
                    flex-direction: row;
                    max-height: 32px;
                    margin-right: 14px;
                }

                .yes_button {
                    background-color: rgba(109, 196, 109, 0.6);
                    border-radius: 8px 0 0 8px;
                    border-right: none;
                }

                .yes_button:hover,
                .yes_button.selected {
                    background-color: rgba(109, 196, 109, 1);
                }

                .yes_button.selected:hover {
                    background-color: rgb(60, 168, 60);
                }

                .no_button {
                    background-color:rgba(197, 106, 106, 0.6);
                    border-radius: 0 8px 8px 0;
                }

                .no_button:hover,
                .no_button.selected {
                    background-color:rgb(216, 118, 118);
                }

                .no_button.selected:hover {
                    background-color:rgb(216, 93, 93);
                }

                .greyed {
                    background-color: rgba(184, 184, 184, 0.8);
                }`
            document.querySelector('head').appendChild(styles);
        };
        //Deconstruct opts
        const { toggle_function = null, placeholder = false, start_state = 'neutral', required = false, true_message = 'Yes', false_message = 'No', allow_toggle = true, allow_refresh = false, question_type = 'self_care'} = opts;

        //Check required properties have been supplied.
        this.error = true;
        if (!placeholder) console.error('Failed to create toggle, no placholder supplied');
        if (elem === null) console.error('Failed to create toggle, elem supplied is null (may not exist)');

        //Bind properties
        //TODO: Create dynamic addition of more properties
        this.elem = elem; //Store the original elem if we need to destory this lad at any point.
        this.placeholder = placeholder;
        this.state = (start_state === 'neutral') ? null : !start_state;
        this.required = required;
        this.allow_toggle = allow_toggle;
        this.error = false;
        this.marked = false;
        this.allow_refresh = allow_refresh;
        this.question_type = question_type;
        this.toggle_function = toggle_function;

        //Create a counter if not exist, then set id.
        this.id = "ToggleButton_ID_" + Date.now() + '_' + window.toggles.counter++;
        elem.id = this.id;

        //Collect and create element.
        try { 
            const template = `
                <div class="surrounding_div">
                    <span class="main_label">${placeholder}</span>
                    <span class="toggle_container"><span class="yes_button" id="yes_button_${this.id}">${true_message}</span><span class="no_button" id="no_button_${this.id}">${false_message}</span>
                    ${(() => {
                        if (this.allow_refresh) return `<span id="refresh_button_${this.id}" class="refresh_button"><img src="../shared_assets/refresh.svg"></span>`;
                        return '';
                    })()}
                    </span>
                </div>`; //TODO: Set image src with JS instead of using the relative URL which could be flimsy given this is a shared class.
            
            window.toggles.register.push(this);

            elem.innerHTML = template;
            this.set(this.state);
            
            //Add listeners
            document.querySelector(`#yes_button_${this.id}`).addEventListener('click', () => this.set(true));
            document.querySelector(`#no_button_${this.id}`).addEventListener('click', () => this.set(false));
            if (this.allow_refresh) document.querySelector(`#refresh_button_${this.id}`).addEventListener('click', () => this.change_placeholder(this.ipcRenderer.sendSync('questions', {type: this.question_type, number: 1})[0]));
                
        } catch (err) {
            //TODO: remove failed init attempt just in case.
            console.error(`Failed to create toggle element. ${err.stack}`);
            this.error = true;
        }
    }
    getData() {
        if (this.error) return console.error('Cannot get data, element failed to initalise');
        return this.state;
    }
    set(state) {
        if (this.error) return console.error('Cannot set state, element failed to initalise');
        
        if (this.state === state && state !== null && this.allow_toggle) this.state = !state;
        else this.state = state;

        document.querySelector(`#yes_button_${this.id}`).classList = `yes_button${(this.state === null) ? '' : (this.state) ? ' selected' : ' greyed'}`;
        document.querySelector(`#no_button_${this.id}`).classList = `no_button${(this.state === null) ? '' : (!this.state) ? ' selected' : ' greyed'}`;
        this.mark(false);
        if (this.toggle_function) this.toggle_function(this.state);
    }
    check() { //Returns true if fully filled out, false if not.
        if (this.error) return console.error('Cannot get state, element failed to initalise');
        return !this.required || this.state !== null;
    }
    change_placeholder(placeholder) {
        if (this.error) return console.error('Cannot change label, element failed to initalise');
        document.querySelector(`#${this.id} .main_label`).innerText = placeholder;
        this.placeholder = placeholder;
        this.set(null);
    }
    destroy() { //Remove this lad
        let existing_item = document.querySelector(`#${this.id}`);
        existing_item.parentNode.replaceChild(this.elem, existing_item);
    }
    mark(state) {
        this.marked = state;
        document.querySelector(`#${this.id} .surrounding_div`).classList = `surrounding_div${(state) ? ' marked' : ''}`;
    }
}

module.exports = Toggle;