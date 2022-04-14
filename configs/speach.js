const speach = {
    errors: {
        testsweetnotfound: `Looks like you are not inside a project directory. 'testsweet.confg.json' file is missing, please create it first.\n`,
    },
    lables: {
        usage: "\nUsage: testsweet <flag=value>|<command> [options]\n\n",
    },
    commands: [
        {
            command: "init",
            desc: "Initilize the testsweet config file.",
            msg: false,
            options: false,
            arguments: false,
            script: "init",
        },
        {
            command: "scafold",
            desc: "Generate your unit test scafolding.",
            msg: false,
            options: false,
            arguments: true,
            script: "scafold",
        },
        {
            command: "faker",
            desc: "Generate fake APIs with mock data into your unit tests.",
            msg: false,
            options: false,
            arguments: true,
            script: "faker",
        },
        
    ],
    comand_props: {
        init: {
            msg: "Choose your target framework.",
            options: ["Cypress", "Jasmin", "Jest", "JUnit", 'PHPUnit', 'pyUnit']
            // options: [ "Jasmin", "JUnit"]
        },
        generate: {
            msg: null,
            options: null
        }
    }
}

module.exports = speach;