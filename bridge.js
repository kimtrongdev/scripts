const ipc = require('node-ipc');
var sendMessage = require('native-messaging')(handleMessage)

function handleMessage (req) {
    sendMessage({result: JSON.stringify(req) + 'OK'})
}

// //send a message to chrome
//
// //listen message from chrome
// chromeBridge.on('message', function(msg){
//     console.log('received from chrome:', msg);
//     chromeBridge.sendMessage({text:'hello chrome!'});
//
//     if(msg=='start'){
//         ipc.config.id = 'a-unique-process-name2';
//         ipc.config.retry = 1500;
//         ipc.config.silent = true;
//         ipc.connectTo('a-unique-process-name1', () => {
//             ipc.of['jest-observer'].on('connect', () => {
//                 ipc.of['jest-observer'].emit('a-unique-message-name', "The message we send");
//             });
//         });
//     }
// });