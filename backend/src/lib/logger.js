
const util = require('util');


console.log = function() {
    let args = Array.from(arguments).map(arg => typeof arg === 'object' ? util.inspect(arg) : arg);

    const date = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

    args.unshift(`\x1b[90m[ ${date} ]\x1b[0m\t\t`);
    return process.stdout.write(args.join(' ') + '\n');
};

console.error = function() {
    let args = Array.from(arguments).map(arg => typeof arg === 'object' ? util.inspect(arg) : arg);

    const date = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

    args.unshift(`\x1b[90m[ ${date} ]\x1b[31m\t\t`);
    return process.stdout.write(args.join(' ') + '\n');
};

console.info = function() {
    let args = Array.from(arguments).map(arg => typeof arg === 'object' ? util.inspect(arg) : arg);

    const date = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

    args.unshift(`\x1b[90m[ ${date} ]\x1b[34m\t\t`);  
    return process.stdout.write(args.join(' ') + '\n');
};

console.log('System is starting');