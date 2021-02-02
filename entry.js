class Entry {
    constructor(opt) {
        if (opt) {
            //TODO: Add some basic checking to ensure this is actually a proper entry object (add defualts and deconstruct);
            this = opt;
        }
        else {
            this.data = {
                quick_entries: [
    
                ],
                full_entries: [
    
                ]
            };
            this.timestamp = Date.now();
        };
    }
    add_diary_entry(entry) {
        let { summary, self_care, details, extras } = entry; //Validation
        let timestamp = Date.now();


    }
    add_quick_entry() {

    }
    remove_entry() {

    }
    generate_pdf() {

    }
    stringify() {

    }
    generate_markdown() {

    }
}

module.exports = Entry;