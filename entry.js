const converter = require('html-to-markdown');


class Entry {
    constructor(opts) {
        this.quick_entries = [];
        this.full_entry = {};
        this.timestamp = Date.now();
        this.start_day = new Date().setHours(0, 0, 0, 0);
        this.markdown = '';
        if (opts) parse(opts);
    }
    add_diary_entry(entry) {
        entry.timestamp = Date.now();
        this.full_entry = entry;
    }
    add_quick_entry(quick_entry) {
        quick_entry.timestamp = Date.now();
        this.quick_entries.push(quick_entry);
    }
    remove_entry(identifier) {
        //TODO
    }
    stringify() {
        return JSON.stringify(this);
    }
    parse(parsed_data) {
        try {
            // let parsed_data = JSON.parse(data);
            this.quick_entries = parsed_data.quick_entries;
            this.full_entry = parsed_data.full_entry;
            this.timestamp = parsed_data.timestamp;
            this.markdown = parsed_data.markdown;
            this.start_day = parsed_data.start_day;
            
        } catch (err) {
            console.error(`Error parsing data to createa new entryObject ${err}`);
            return new Entry();
        }
    }
    generate_markdown() {
        this.timestamp = Date.now();
        this.quick_entries = [];
        try {
            this.markdown = `# Diary Entry Dated: ${new Date().toDateString()}

            ## Quick Summary of Today
            In a word, you described this day as ${this.full_entry.feeling} and the main thing you worked on was ${this.full_entry.goal}.

            You summarised today as ${this.full_entry.sentence}.

            ## Self Care
            ${() => {
                let output = '';
                entry.self_care.forEach(self_care => {
                    new_line = `The question was **${self_care[0]}**, and you answered: **${self_care[1]}**.\n`;
                    output += new_line;
                });
                return output;
            }};

            ### Quick Entries
            ${() => {
                if(this.quick_entries.length === 0) {
                    return "You didn't make any quick entries on this date.";
                } else {
                    let output = '';
                    this.quick_entries.forEach(quick_entry => {

                    });
                    return output;
                }
            }};

            ## Details
            
            ### ${this.full_entry.details[0][0]}
            ${converter.convert(this.full_entry.details[0][1])}

            ### ${this.full_entry.details[1][0]}
            ${converter.convert(this.full_entry.details[1][1])}

            ${() => {
                if (this.full_entry.extras.length > 0) {
                    return `## You had some extra comments today that we didn't cover already:

                    ${converter.convert(this.full_entry.extras)};`
                }
            }}

            That was all for this diary entry.`;
        } catch (err) {
            console.error(`Failed to create markdown from diary entry ${err}`);
        }
        return this.markdown;
    }
}

module.exports = Entry;